import firebase from 'firebase/app';
import 'firebase/firestore';
import { AnyAction, Unsubscribe } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Character } from '../../models/Character';
import { RequestOptions } from '../../models/RequestOptions';
import {
  pushCharactersInStore,
  removeCharactersFromStore,
  setCharactersInStore,
  setIsHaveMoreCharacters,
  setLastCharacterId,
} from '../../store/Characters/charactersThunks/storeThunks';
import { firebaseConverter } from '../../utils/FirebaseConverters';
import { getChunkedArray } from '../../utils/utils';
import { CharacterDTO } from '../dtos/CharactersDto';
import { firestore } from '../firebase-config';
import { CharacterMapper } from '../mappers/CharactersMapper';

/** Function for processesing response from server */
function snapshotResponse(
  doc: firebase.firestore.QuerySnapshot<CharacterDTO>,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
): void {
  if (doc.size === 0) {
    dispatch(setIsHaveMoreCharacters(false));
    return;
  }

  const addedDocs: Character[] = [];
  const modifiedDocs: Character[] = [];
  const removedDocs: Character[] = [];

  doc.docChanges().forEach((character) => {
    switch (character.type) {
      case 'modified': {
        modifiedDocs.push(CharacterMapper.transformResponse(character.doc.data(), character.doc.id));
        break;
      }
      case 'removed': {
        removedDocs.push(CharacterMapper.transformResponse(character.doc.data(), character.doc.id));
        break;
      }
      case 'added':
      default: {
        addedDocs.push(CharacterMapper.transformResponse(character.doc.data(), character.doc.id));
        break;
      }
    }
  });

  if (addedDocs.length) {
    dispatch(setLastCharacterId(doc.docs[doc.docs.length - 1].id));
    dispatch(pushCharactersInStore(addedDocs));
  }
  if (modifiedDocs.length) {
    dispatch(setCharactersInStore(modifiedDocs));
  }
  if (removedDocs.length) {
    dispatch(removeCharactersFromStore(removedDocs));
  }
}

/** Object for work with character API */
export const CharacterAPI = {
  /** Get all list of characters */
  async getAllCharacters(): Promise<Character[]> {
    return firestore
      .collection('people')
      .withConverter(firebaseConverter<CharacterDTO>())
      .get()
      .then((characters) =>
        characters.docs.map((character) => CharacterMapper.transformResponse(character.data(), character.id)),
      );
  },

  /**
   * Get first part of characters and subscribe to their updates
   * Sorted by @sortTarget
   */
  getInitialCharacters(
    { chunkSize, sortTarget }: RequestOptions,
    dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
  ): Unsubscribe {
    return firestore
      .collection('people')
      .withConverter(firebaseConverter<CharacterDTO>())
      .orderBy(sortTarget)
      .limit(chunkSize)
      .onSnapshot((doc: firebase.firestore.QuerySnapshot<CharacterDTO>) => {
        snapshotResponse(doc, dispatch);
      });
  },

  /** Get characters startAfter lastDoc from store and subscribe to their updates */
  async getNextCharacters(
    { chunkSize, sortTarget }: RequestOptions,
    dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
    lastDocId: string,
  ): Promise<Unsubscribe> {
    const characterDoc = await firestore.collection('people').doc(lastDocId).get();

    return firestore
      .collection('people')
      .withConverter(firebaseConverter<CharacterDTO>())
      .orderBy(sortTarget)
      .startAfter(characterDoc)
      .limit(chunkSize)
      .onSnapshot((doc: firebase.firestore.QuerySnapshot<CharacterDTO>) => {
        snapshotResponse(doc, dispatch);
      });
  },

  /**
   * Get related characters data
   * Frebase cannot get more then 10 item by 1 requset.
   * So we have to chunked array and make multiple requests.
   */
  async getCharactersByPk(pkArray: (number | string)[]): Promise<Character[]> {
    if (pkArray.length > 10) {
      const chunkedArr: (string | number)[][] = getChunkedArray(pkArray, 10);
      const promises: Promise<Character[]>[] = [];

      for (let i = 0; i < chunkedArr.length; i++) {
        promises.push(this.getCharactersByPk(chunkedArr[i]));
      }

      const data: Character[][] = await Promise.all(promises);
      return data.flat(Infinity) as Character[];
    }

    return firestore
      .collection('people')
      .where('pk', 'in', pkArray)
      .withConverter(firebaseConverter<CharacterDTO>())
      .get()
      .then((characters) =>
        characters.docs.map((character) => CharacterMapper.transformResponse(character.data(), character.id)),
      );
  },

  /** Get character from db by ID */
  async getCharacterById(id: string): Promise<Character> {
    return firestore
      .collection('people')
      .withConverter(firebaseConverter<CharacterDTO>())
      .doc(id)
      .get()
      .then((character) => CharacterMapper.transformResponse(character.data() as CharacterDTO, character.id));
  },

  /** Get character from db by name */
  async getCharacterByName(name: string): Promise<Character> {
    return firestore
      .collection('people')
      .withConverter(firebaseConverter<CharacterDTO>())
      .where('fields.name', '==', name)
      .get()
      .then((character) => CharacterMapper.transformResponse(character.docs[0].data(), character.docs[0].id));
  },
};
