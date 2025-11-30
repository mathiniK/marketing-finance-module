import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

/**
 * Reusable Stat Card Component
 * Displays a metric with title, value, and optional icon
 */
const StatCard = ({ title, value, icon, color = '#4fc3f7', trend }) => {
  return (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
            {trend && (
              <Typography variant="body2" sx={{ mt: 1, color: trend > 0 ? 'success.main' : 'error.main' }}>
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                bgcolor: `${color}20`,
                color: color,
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;


