import { FirebaseDTO } from './firebase-dto';

/**
 * Interface for planet DTO
 */
export interface PlanetDTO extends FirebaseDTO {
  /**
   * Main object fields
   */
  readonly fields: {
    /**
     * Planet climate
     */
    readonly climate: string;
    /**
     * Planet diameter
     */
    readonly diameter: string;
    /**
     * When note was created
     */
    readonly created: string;
    /**
     * When note was edited last time
     */
    readonly edited: string;
    /**
     * Planet gravity
     */
    readonly gravity: string;
    /**
     * Planet name
     */
    readonly name: string;
    /**
     * Planet orbital period
     */
    readonly orbital_period: string;
    /**
     * Planet population
     */
    readonly population: string;
    /**
     * Planet rotation period
     */
    readonly rotation_period: string;
    /**
     * Planet surface water
     */
    readonly surface_water: string;
    /**
     * Planet terrain
     */
    readonly terrain: string;
  };
}
