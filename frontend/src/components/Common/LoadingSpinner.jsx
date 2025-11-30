import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading Spinner Component
 * Shows a centered loading spinner with optional message
 */
const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
      }}
    >
      <CircularProgress size={50} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
};

export default LoadingSpinner;


