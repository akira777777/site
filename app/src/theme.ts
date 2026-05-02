import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#B026FF', // casino-neon
    },
    secondary: {
      main: '#00FFCC', // casino-cyber
    },
    background: {
      default: '#080612', // casino-ink
      paper: '#1A1025', // casino-charcoal
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9E8BCC', // casino-muted
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Bodoni Moda", serif',
    },
    h2: {
      fontFamily: '"Bodoni Moda", serif',
    },
    h3: {
      fontFamily: '"Bodoni Moda", serif',
    },
    button: {
      fontFamily: '"IBM Plex Mono", monospace',
      letterSpacing: '0.1em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'uppercase',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1A1025',
          borderRadius: '16px',
          border: '1px solid rgba(176,38,255,0.1)',
        },
      },
    },
  },
});
