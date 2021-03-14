import { makeStyles, Button } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },

  filmsList: {
    overflowY: 'scroll',
    flexGrow: 1,
  },
  link: {
    textDecoration: 'none',
  },
  activeLink: {
    backgroundColor: theme.palette.grey[300],
    textAlign: 'center',
  },
  transparentColor: {
    color: 'transparent',
  },

  processingButtons: {
    display: 'flex',
    width: '100%',
    padding: theme.spacing(2, 4),
    justifyContent: 'space-between',
  },

  editButtons: {
    display: 'flex',

    '&>:first-child': {
      marginRight: '10px',
    },
  },
}));

export function ProcessingButtons(props: any): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.processingButtons}>
      <Link className={classes.link} to="/films/add">
        <Button color="primary" variant="contained">
          Add film
        </Button>
      </Link>

      {props.id ? (
        <div className={classes.editButtons}>
          <Button color="secondary" variant="contained">
            Remove film
          </Button>
          <Link className={classes.link} to={`/films/${props.id}/edit`}>
            <Button color="primary" variant="contained">
              Edit film
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
