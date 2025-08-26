import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  LinearProgress,
  Alert,
  Fade,
  Paper,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Agriculture as AgricultureIcon,
  Landscape as LandscapeIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import the custom hook
import { useRSBSAForm } from './useRSBSAForm';

// Import form sections (we'll create these)
import BeneficiaryProfileSection from './sections/BeneficiaryProfileSection';
import FarmProfileSection from './sections/FarmProfileSection';
import FarmParcelsSection from './sections/FarmParcelsSection';
import LivelihoodDetailsSection from './sections/LivelihoodDetailsSection';
import ReviewSection from './sections/ReviewSection';
import SubmissionSection from './sections/SubmissionSection';

// Styled components for modern design
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  }
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  '& .MuiStepLabel-root': {
    '& .MuiStepLabel-iconContainer': {
      '& .MuiSvgIcon-root': {
        fontSize: '1.8rem',
        color: theme.palette.primary.main,
        '&.Mui-active': {
          color: theme.palette.primary.main,
        },
        '&.Mui-completed': {
          color: theme.palette.success.main,
        }
      }
    }
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`
}));

const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`
}));

const RSBSAForm = () => {
  const {
    formData,
    errors,
    setErrors,
    isLoading,
    isSubmitting,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    saveDraft,
    resetForm,
    updateField,
    addFarmParcel,
    updateFarmParcel,
    removeFarmParcel,
    updateLivelihoodDetails
  } = useRSBSAForm();

  // Calculate form completion percentage
  const calculateProgress = () => {
    let completedFields = 0;
    let totalFields = 0;
    
    // Count completed fields in beneficiary profile
    Object.keys(formData.beneficiaryProfile).forEach(key => {
      if (formData.beneficiaryProfile[key] !== null && 
          formData.beneficiaryProfile[key] !== '' && 
          formData.beneficiaryProfile[key] !== false) {
        completedFields++;
      }
      totalFields++;
    });
    
    // Count completed fields in farm profile
    if (formData.farmProfile.livelihood_category_id) completedFields++;
    totalFields++;
    
    // Count completed farm parcels
    if (formData.farmParcels.length > 0) completedFields++;
    totalFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // Check if current step has errors
  const hasStepErrors = () => {
    return Object.keys(errors).some(key => {
      if (key.includes('.')) {
        const [section] = key.split('.');
        return section === getCurrentStepSection();
      }
      return false;
    });
  };

  // Get current step section name
  const getCurrentStepSection = () => {
    switch (currentStep) {
      case 1: return 'beneficiaryProfile';
      case 2: return 'farmProfile';
      case 3: return 'farmParcels';
      case 4: return 'livelihoodDetails';
      default: return '';
    }
  };

  // Get step title for display
  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Personal Information';
      case 2: return 'Farm Profile';
      case 3: return 'Farm Parcels';
      case 4: return 'Livelihood Details';
      case 5: return 'Review & Submit';
      case 6: return 'Submission Complete';
      default: return 'Unknown Step';
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const success = await submitForm();
      if (success) {
        setShowSuccess(true);
        setShowError(false);
      } else {
        setShowError(true);
        setErrorMessage('Form submission failed. Please check your inputs and try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setShowError(true);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  // Check if form can be submitted
  const canSubmit = () => {
    return Object.keys(errors).length === 0 && 
           formData.farmParcels.length > 0 && 
           formData.farmProfile.livelihood_category_id;
  };

  // Handle next step with validation
  const handleNextStep = () => {
    if (hasStepErrors()) {
      // Show error message
      console.log('Current step has validation errors. Please fix them before proceeding.');
      return;
    }
    nextStep();
  };

  // Handle previous step
  const handlePrevStep = () => {
    prevStep();
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step configuration
  const steps = [
    {
      label: 'Personal Information',
      icon: <PersonIcon />,
      description: 'Basic beneficiary details'
    },
    {
      label: 'Farm Profile',
      icon: <AgricultureIcon />,
      description: 'Farm and livelihood information'
    },
    {
      label: 'Farm Parcels',
      icon: <LandscapeIcon />,
      description: 'Land ownership details'
    },
    {
      label: 'Livelihood Details',
      icon: <WorkIcon />,
      description: 'Specific agricultural activities'
    },
    {
      label: 'Review',
      icon: <AssessmentIcon />,
      description: 'Review all information'
    },
    {
      label: 'Submit',
      icon: <SendIcon />,
      description: 'Submit your application'
    }
  ];

  // Handle form reset
  const handleReset = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      resetForm();
      setShowSuccess(false);
      setShowError(false);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      // eslint-disable-next-line no-alert
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      // eslint-disable-next-line no-alert
      alert('Failed to save draft. Please try again.');
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BeneficiaryProfileSection
            formData={formData.beneficiaryProfile}
            errors={errors}
            updateField={(field, value) => updateField('beneficiaryProfile', field, value)}
          />
        );
      case 2:
        return (
          <FarmProfileSection
            formData={formData.farmProfile}
            errors={errors}
            updateField={(field, value) => updateField('farmProfile', field, value)}
          />
        );
      case 3:
        return (
          <FarmParcelsSection
            farmParcels={formData.farmParcels}
            errors={errors}
            addFarmParcel={addFarmParcel}
            updateFarmParcel={updateFarmParcel}
            removeFarmParcel={removeFarmParcel}
          />
        );
      case 4:
        return (
          <LivelihoodDetailsSection
            livelihoodDetails={formData.livelihoodDetails}
            updateLivelihoodDetails={updateLivelihoodDetails}
          />
        );
      case 5:
        return (
          <ReviewSection
            formData={formData}
            errors={errors}
            onEdit={goToStep}
          />
        );
      case 6:
        return (
          <SubmissionSection
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            canSubmit={canSubmit()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>RSBSA Registration Form - Registry System for Basic Sectors in Agriculture</title>
        <meta 
          name="description" 
          content="Complete your RSBSA registration to access agricultural programs and benefits" 
        />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            RSBSA Registration Form
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Registry System for Basic Sectors in Agriculture
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Complete this form to register as a beneficiary and access agricultural programs, 
            services, and benefits provided by the Department of Agriculture.
          </Typography>
        </Paper>

        {/* Progress Container */}
        <ProgressContainer>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Form Progress: {calculateProgress()}% Complete
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={calculateProgress()} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={saveDraft}
                disabled={isSubmitting}
                size="small"
              >
                Save Draft
              </Button>
            </Grid>
          </Grid>
          
          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <Alert 
              severity="error" 
              sx={{ mt: 2, borderRadius: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => setErrors({})}
                >
                  Clear
                </Button>
              }
            >
              <Typography variant="body2" fontWeight="bold">
                Please fix the following errors before proceeding:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>
                    <Typography variant="body2">
                      <strong>{field.includes('.') ? field.split('.')[1] : field}:</strong> {message}
                    </Typography>
                  </li>
                ))}
              </Box>
            </Alert>
          )}
        </ProgressContainer>

        {/* Success/Error Messages */}
        <Fade in={showSuccess}>
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setShowSuccess(false)}
          >
            <Typography variant="h6" gutterBottom>Form Submitted Successfully!</Typography>
            Your RSBSA application has been submitted and is now being processed. 
            You will receive updates on your application status.
          </Alert>
        </Fade>

        <Fade in={showError}>
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setShowError(false)}
          >
            <Typography variant="h6" gutterBottom>Submission Failed</Typography>
            {errorMessage}
          </Alert>
        </Fade>

        {/* Main Form Card */}
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            {/* Stepper */}
            <StyledStepper activeStep={currentStep - 1} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel 
                    icon={step.icon}
                    onClick={() => goToStep(index + 1)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </StyledStepper>

            {/* Form Content */}
            <Box sx={{ mt: 4 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    Loading form data...
                  </Typography>
                </Box>
              ) : (
                renderStepContent()
              )}
            </Box>

            {/* Action Buttons */}
            <ActionButtonContainer>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handlePrevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                Previous
              </Button>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Show validation status */}
                {hasStepErrors() && (
                  <Chip 
                    label="Fix errors to continue" 
                    color="error" 
                    size="small"
                    icon={<Alert severity="error" />}
                  />
                )}
                
                {currentStep < totalSteps ? (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNextStep}
                    disabled={isSubmitting || hasStepErrors()}
                    sx={{ minWidth: 120 }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    endIcon={<SendIcon />}
                    onClick={submitForm}
                    disabled={isSubmitting || hasStepErrors()}
                    sx={{ minWidth: 120 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </Box>
            </ActionButtonContainer>
          </CardContent>
        </StyledCard>

        {/* Form Information Footer */}
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 4, 
            p: 3, 
            backgroundColor: 'background.default',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" gutterBottom color="primary">
            Important Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Data Privacy:</strong> Your information is protected under the Data Privacy Act of 2012.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Auto-Save:</strong> Your progress is automatically saved as you complete each section.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Support:</strong> Contact your local DA office for assistance with this form.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default RSBSAForm;