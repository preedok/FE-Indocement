
export const translateEntryStatus = (status) => {
    const statusMap = {
        'SUCCESS': 'SUCCESS',
        'CAPTURED_AWAITING_MANUAL_DATA': 'PENDING DATA',
        'ENTRY_COMPLETED_AWAITING_MANUAL_DATA': 'WAIT ENTRYDATA',
        'MANUALLY_VERIFIED': 'VERIFIED'
    };

    return statusMap[status] || status;
};


export const translateExitStatus = (status) => {
    const statusMap = {
        'SUCCESS': 'SUCCESS',
        'CAPTURED_AWAITING_MANUAL_DATA': 'PENDING DATA',
        'EXIT_COMPLETED_AWAITING_MANUAL_DATA': 'WAIT EXITDATA',
        'MANUALLY_VERIFIED': 'VERIFIED'
    };

    return statusMap[status] || status;
};


export const getEntryStatusBadgeColor = (status) => {
    const colorMap = {
        'SUCCESS': 'bg-green-100 text-green-800 border-green-200',
        'CAPTURED_AWAITING_MANUAL_DATA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'ENTRY_COMPLETED_AWAITING_MANUAL_DATA': 'bg-blue-100 text-white-800 border-orange-200',
        'MANUALLY_VERIFIED': 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getExitStatusBadgeColor = (status) => {
    const colorMap = {
        'SUCCESS': 'bg-green-100 text-green-800 border-green-200',
        'CAPTURED_AWAITING_MANUAL_DATA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'EXIT_COMPLETED_AWAITING_MANUAL_DATA': 'bg-blue-100 text-blue-800 border-orange-200',
        'MANUALLY_VERIFIED': 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};


export const getStatusPriority = (status) => {
    const priorityMap = {
        'CAPTURED_AWAITING_MANUAL_DATA': 1,
        'ENTRY_COMPLETED_AWAITING_MANUAL_DATA': 2,
        'EXIT_COMPLETED_AWAITING_MANUAL_DATA': 2,
        'MANUALLY_VERIFIED': 3,
        'SUCCESS': 4
    };

    return priorityMap[status] || 5;
};


export const requiresManualIntervention = (status) => {
    const manualStatuses = [
        'CAPTURED_AWAITING_MANUAL_DATA',
        'ENTRY_COMPLETED_AWAITING_MANUAL_DATA',
        'EXIT_COMPLETED_AWAITING_MANUAL_DATA'
    ];

    return manualStatuses.includes(status);
};


export const getStatusDescription = (status) => {
    const descriptionMap = {
        'SUCCESS': 'Transaction completed successfully',
        'CAPTURED_AWAITING_MANUAL_DATA': 'Vehicle captured, waiting for manual data entry',
        'ENTRY_COMPLETED_AWAITING_MANUAL_DATA': 'Entry completed, awaiting manual verification',
        'EXIT_COMPLETED_AWAITING_MANUAL_DATA': 'Exit completed, awaiting manual verification',
        'MANUALLY_VERIFIED': 'Transaction has been manually verified'
    };

    return descriptionMap[status] || 'Unknown status';
};