import React, { useEffect, useState } from 'react';
import { Paper, FormGroup, TextField, Button } from '@material-ui/core';
import { Formik, Form, Field, FieldProps } from 'formik';
import { Prompt, Redirect } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Film } from '../../models/Film';
import { Planet } from '../../models/Planet';
import { getNamesByPk, getPkByNames } from '../../utils/utils';
import { Character } from '../../models/Character';
import { useThunkDispatch } from '../../store/store';
import { selectAllPlanets } from '../../store/Planets/planetSelectors';
import { AccordionCheckList } from '../AccordionCheckList/AccordionCheckList';
import { selectAllCharacters } from '../../store/Characters/characterSelectors';
import { addFilmInDb, editFilmIdDb } from '../../store/Films/filmsThunks/combinedThunks';
import { filmFormStyles } from './FilmFormStyles';
import { filmSchema } from '../../utils/validateSchemas';
import { getAllCharacters } from '../../store/Characters/charactersThunks/combinedThunks';
import { getAllPlanets } from '../../store/Planets/planetsThunks/combinedThunks';

interface FormData {
  title: string;
  episodeId: string;
  releaseDate: string;
  director: string;
  producer: string;
  openingCrawl: string;
}

interface Props {
  /** Initial form data */
  initData: FormData;
  /** Film id, if forType is edit */
  filmId?: string;
  /** Type of form */
  formType: 'add' | 'edit';
  /** List of related planets keys */
  selectedPlanetsPk: string[];
  /** List of related characters keys */
  selectedCharactersPk: string[];
}

/** Form for proccesing film */
export function FilmForm(props: Props): JSX.Element {
  const classes = filmFormStyles();
  const dispatch = useThunkDispatch();

  const [redirect, setRedirect] = useState(false);
  const [canDeactivate, setCanDeactivate] = useState(true);

  const planetsList = useSelector(selectAllPlanets);
  const charactersList = useSelector(selectAllCharacters);

  let checkedPlanetsPk: string[] = [];
  let checkedCharactersPk: string[] = [];

  /** Get related film data */
  useEffect(() => {
    dispatch(getAllPlanets());
    dispatch(getAllCharacters());
  }, []);

  /** Set checked planets PK in array */
  const getCheckedPlanets = (values: string[]) => {
    checkedPlanetsPk = getPkByNames<Planet>(planetsList, values);
  };

  /** Set checked charactgers PK in array */
  const getCheckedCharacters = (values: string[]) => {
    checkedCharactersPk = getPkByNames<Character>(charactersList, values);
  };

  /** Set dirty, if check list was touched */
  const setDirty = () => {
    setCanDeactivate(false);
  };

  const handleSubmit = (values: FormData) => {
    const film: Film = {
      title: values.title,
      releaseDate: new Date(values.releaseDate),
      episodeId: Number(values.episodeId),
      director: values.director,
      producer: values.producer,
      openingCrawl: values.openingCrawl,
      created: new Date(),
      planetsPk: checkedPlanetsPk,
      charactersPk: checkedCharactersPk,
      speciesPk: [],
      starshipsPk: [],
      vehiclesPk: [],
      pk: uuidv4(),
      id: props.filmId || '',
    };

    dispatch(props.formType === 'add' ? addFilmInDb(film) : editFilmIdDb(film)).then(() => {
      setCanDeactivate(true);
      setRedirect(true);
    });
  };

  return (
    <Paper className={classes.root} elevation={0}>
      <Formik initialValues={props.initData} onSubmit={handleSubmit} validationSchema={filmSchema}>
        <Form
          onChange={() => {
            setCanDeactivate(false);
          }}
        >
          <FormGroup className={classes.formGroup}>
            <Field name="title">
              {({ field, meta }: FieldProps) => (
                <TextField
                  label="Film title"
                  type="text"
                  variant="outlined"
                  fullWidth
                  {...field}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
          </FormGroup>
          <FormGroup className={classes.formGroup}>
            <Field name="episodeId">
              {({ field, meta }: FieldProps) => (
                <TextField
                  label="Episode id"
                  type="number"
                  variant="outlined"
                  fullWidth
                  {...field}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
          </FormGroup>

          <FormGroup className={classes.formGroup}>
            <Field name="releaseDate">
              {({ field, meta }: FieldProps) => (
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  label="Release date"
                  type="date"
                  variant="outlined"
                  {...field}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
          </FormGroup>

          <FormGroup className={classes.formGroup}>
            <Field name="director">
              {({ field }: FieldProps) => (
                <TextField label="Director" type="text" variant="outlined" fullWidth {...field} />
              )}
            </Field>
          </FormGroup>

          <FormGroup className={classes.formGroup}>
            <Field name="producer">
              {({ field }: FieldProps) => (
                <TextField label="Producer" type="text" variant="outlined" fullWidth {...field} />
              )}
            </Field>
          </FormGroup>
          <FormGroup className={classes.formGroup}>
            <Field name="openingCrawl">
              {({ field }: FieldProps) => (
                <TextField label="Opening crawl" rows={5} variant="outlined" multiline {...field} />
              )}
            </Field>
          </FormGroup>
          <AccordionCheckList
            getCheckedValues={getCheckedPlanets}
            listOptions={planetsList.map((planet) => planet.name)}
            selected={getNamesByPk<Planet>(planetsList, props.selectedPlanetsPk)}
            setDirty={setDirty}
            title="Planets"
          />
          <AccordionCheckList
            getCheckedValues={getCheckedCharacters}
            listOptions={charactersList.map((character) => character.name)}
            selected={getNamesByPk<Character>(charactersList, props.selectedCharactersPk)}
            setDirty={setDirty}
            title="Characters"
          />

          <div className={classes.buttons}>
            <Link className={classes.link} to="/films">
              <Button color="secondary" variant="contained" fullWidth>
                Cancel
              </Button>
            </Link>

            <Button color="primary" type="submit" variant="contained" fullWidth>
              Save
            </Button>
          </div>
        </Form>
      </Formik>

      <Prompt message="You have unsaved changes, are you sure you want to leave?" when={!canDeactivate} />
      {redirect ? <Redirect to={props.filmId ? `/films/${props.filmId}/details` : '/films'} /> : null}
    </Paper>
  );
}

FilmForm.defaultProps = {
  initData: {
    title: '',
    episodeId: '',
    releaseDate: '',
    director: '',
    producer: '',
    openingCrawl: '',
  },
  selectedPlanetsPk: [],
  selectedCharactersPk: [],
};
