import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';

/**
 * Sidebar Navigation Component
 * Contains navigation links to all main pages
 */
const Sidebar = ({ onClose }) => {
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      title: 'Marketing',
      icon: <CampaignIcon />,
      path: '/marketing',
    },
    {
      title: 'Income',
      icon: <TrendingUpIcon />,
      path: '/income',
    },
    {
      title: 'Expenses',
      icon: <TrendingDownIcon />,
      path: '/expenses',
    },
    {
      title: 'Invoices',
      icon: <ReceiptIcon />,
      path: '/invoices',
    },
    {
      title: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
    },
  ];

  return (
    <Box>
      {/* Logo/Brand Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4fc3f7' }}>
          MarketFin
        </Typography>
        <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
          Management System
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: '#2a2a3e' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                color: '#b0b0b0',
                '&:hover': {
                  bgcolor: '#2a2a3e',
                  color: 'white',
                },
                '&.active': {
                  bgcolor: '#4fc3f7',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#29b6f6',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title} 
                primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;


