import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip
} from '@mui/material';
import {
  AccountCircle as UserIcon,
  Person as BeneficiaryIcon,
  Agriculture as FarmIcon,
  Landscape as ParcelIcon,
  Assignment as EnrollmentIcon
} from '@mui/icons-material';

const DatabaseFlowInfo = ({ currentUser, formData }) => {
  const steps = [
    {
      label: 'User Table',
      icon: <UserIcon />,
      description: 'Names come from user profile (read-only)',
      data: {
        user_id: currentUser?.id || 'N/A',
        first_name: formData?.beneficiaryProfile?.first_name || 'N/A',
        last_name: formData?.beneficiaryProfile?.last_name || 'N/A'
      },
      color: 'primary'
    },
    {
      label: 'Beneficiary Details',
      icon: <BeneficiaryIcon />,
      description: 'Personal information and contact details',
      data: {
        user_id: formData?.beneficiaryProfile?.user_id || 'Auto-set',
        barangay: formData?.beneficiaryProfile?.barangay || 'Not set',
        contact_number: formData?.beneficiaryProfile?.contact_number || 'Not set'
      },
      color: 'secondary'
    },
    {
      label: 'Farm Profile',
      icon: <FarmIcon />,
      description: 'Links beneficiary to livelihood category',
      data: {
        beneficiary_id: 'Set by backend',
        livelihood_category_id: formData?.farmProfile?.livelihood_category_id || 'Not selected'
      },
      color: 'success'
    },
    {
      label: 'Farm Parcels',
      icon: <ParcelIcon />,
      description: 'Land ownership details',
      data: {
        farm_profile_id: 'Set by backend',
        parcels_count: formData?.farmParcels?.length || 0
      },
      color: 'warning'
    },
    {
      label: 'RSBSA Enrollment',
      icon: <EnrollmentIcon />,
      description: 'Final enrollment record linking everything',
      data: {
        user_id: formData?.enrollment?.user_id || 'Auto-set',
        beneficiary_id: 'Set by backend',
        farm_profile_id: 'Set by backend',
        application_status: formData?.enrollment?.application_status || 'draft'
      },
      color: 'info'
    }
  ];

  return (
    <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <EnrollmentIcon sx={{ mr: 1 }} />
          Database Relationship Flow
          <Chip label="Development Info" color="info" size="small" sx={{ ml: 2 }} />
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This shows how your form data will be stored across different database tables:
        </Typography>

        <Stepper orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label} active={true}>
              <StepLabel 
                icon={step.icon}
                sx={{ '& .MuiStepIcon-root': { color: `${step.color}.main` } }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'background.default', 
                  p: 2, 
                  borderRadius: 1, 
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  {Object.entries(step.data).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {key}:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default DatabaseFlowInfo;