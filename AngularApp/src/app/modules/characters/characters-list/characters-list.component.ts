import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Character } from 'src/app/core/models/characters';
import { QueryFilterParams } from 'src/app/core/models/query-filter-params';
import { CharacterService } from 'src/app/core/services/character.service';

/**
 * Displaying table of characters
 */
@Component({
  selector: 'app-characters-list',
  templateUrl: './characters-list.component.html',
  styleUrls: ['./characters-list.component.css'],
})
export class CharactersListComponent {
  private queryFilters = new QueryFilterParams('people', 10, 'name');

  /**
   * Form for searching characters
   */
  public searchForm: FormGroup = new FormGroup({
    searchValue: new FormControl(null),
  });

  /**
   * Observable character data array
   */
  public readonly charactersData$: Observable<Character[]>;

  /**
   * Toggle loading spinner and matNoDataRow
   */
  public readonly isLoading$ = new BehaviorSubject(true);

  /**
   * Observable for toggle next button
   */
  public readonly isNextPageAvailable$ = this.characterService.isNextPageAvailable$;

  /**
   * Observable for toggle prev button
   */
  public readonly isPrevPageAvailable$ = this.characterService.isPrevPageAvailable$;

  /**
   * Colums in table header
   */
  public readonly displayedColumns: string[] = ['name', 'gender', 'height', 'mass', 'skinColor'];

  constructor(private readonly characterService: CharacterService) {
    this.charactersData$ = this.characterService.charactersSourceInit(this.queryFilters).pipe(
      tap(() => {
        if (this.isLoading$.value) {
          this.isLoading$.next(false);
        }
      }),
    );
  }

  private turnOffPageBtns(): void {
    this.isPrevPageAvailable$.next(false);
    this.isNextPageAvailable$.next(false);
  }

  /**
   * Add information about, how characters have to be sorted, in queryFilter.
   * Send request for sorting characters.
   */
  public matSort(event: Sort): void {
    if (event.direction) {
      this.queryFilters.sortTarget = event.active;
      this.queryFilters.sortDirection = event.direction as 'asc' | 'desc';
    } else {
      this.queryFilters.sortTarget = 'pk';
      this.queryFilters.sortDirection = 'asc';
    }

    this.queryFilters.pageDirection = 'initial';
    this.characterService.setFilter(this.queryFilters);
  }

  /**
   * Switch table to next page
   */
  public nextPage(): void {
    this.queryFilters.pageDirection = 'next';
    this.turnOffPageBtns();

    this.characterService.setFilter(this.queryFilters);
  }

  /**
   * Switch table to previous page
   */
  public previousPage(): void {
    this.queryFilters.pageDirection = 'previous';
    this.turnOffPageBtns();

    this.characterService.setFilter(this.queryFilters);
  }

  /**
   * Filtering data by character title
   */
  public filterByTitle(): void {
    this.queryFilters.searchValues = this.searchForm.value.searchValue.trim();
    this.queryFilters.pageDirection = 'initial';
    this.characterService.setFilter(this.queryFilters);
  }
}
