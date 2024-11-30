const awsconfig = {
    Auth: {
        // REQUIRED - Amazon Cognito Region
        region: 'us-east-1', // e.g., 'us-east-1'

        // User Pool for Doctors
        doctor: {
            userPoolId: 'us-east-1_rZugm688I', // Replace with Doctor User Pool ID
            userPoolWebClientId: '65llfdchmed5me28oalsom6357', // Replace with Doctor App Client ID
        },

        // User Pool for Patients
        patient: {
            userPoolId: 'us-east-1_IUlJbP0XV', // Replace with Patient User Pool ID
            userPoolWebClientId: '4d0q8v1fbgpfguc9hu4rhchmfb', // Replace with Patient App Client ID
        },
    },
};

export default awsconfig;
