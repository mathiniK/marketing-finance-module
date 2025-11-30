import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

/**
 * Error Alert Component
 * Displays error messages with optional title
 */
const ErrorAlert = ({ error, title = 'Error' }) => {
  const errorMessage = error?.response?.data?.message || error?.message || 'Something went wrong';

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {errorMessage}
    </Alert>
  );
};

export default ErrorAlert;


