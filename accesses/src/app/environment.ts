// src/environments/environment.ts
export const environment = {
    production: false,
    apiUrl: 'https://my-json-server.typicode.com/405786MoroBenjamin/users-responses',
    movementsApi: 'http://localhost:8090',
    endpoints: {
        // Endpoints existentes
        users: '/users',
        movements: '/movements_entryToNeighbor',
        userByDni: '/userAllowedByDni',
        addVehicle: '/addVehicleToUser',
        logicDown: '/logicDown',
        visitorQr: '/visitor-qr/image',
        ownersAndTenants: '/user_Allowed/ownersAndTenants',
        visitorsByOwner: '/user_Allowed/visitors/by',
        updateVisitor: '/user_Allowed/visitor/update',
        vehicleTypes: '/getAll/vehiclesType',
        validateQr: '/visitor-qr',
        generateQr: '/visitor-qr/generate',
        usersType: '/users_Type',
        giveTempRange: '/user_Allowed/giveTempRange',
        usersAllowedWithoutMovements: '/user_Allowed/getAllUsersAllowed/WithAuthRangeWithoutMovements',
        usersAllowed: '/user_Allowed/getAllUsersAllowed',
        movementsEntry: '/movements_entry/register',
        movementsExit: '/movements_exit/register',
        emergencyEntry: '/emergency/register_entry',
        emergencyExit: '/emergency/register_exit'
    }
};

export const API_ENDPOINTS = {
    // Endpoints que usan apiUrl
    USERS: `${environment.apiUrl}${environment.endpoints.users}`,
    
    // Endpoints que usan movementsApi
    MOVEMENTS: `${environment.movementsApi}${environment.endpoints.movements}`,
    USER_BY_DNI: `${environment.movementsApi}${environment.endpoints.userByDni}`,
    ADD_VEHICLE: `${environment.movementsApi}${environment.endpoints.addVehicle}`,
    LOGIC_DOWN: `${environment.movementsApi}${environment.endpoints.logicDown}`,
    VISITOR_QR: `${environment.movementsApi}${environment.endpoints.visitorQr}`,
    VALIDATE_QR: `${environment.movementsApi}${environment.endpoints.validateQr}`,
    GENERATE_QR: `${environment.movementsApi}${environment.endpoints.generateQr}`,
    OWNERS_AND_TENANTS: `${environment.movementsApi}${environment.endpoints.ownersAndTenants}`,
    VISITORS_BY_OWNER: `${environment.movementsApi}${environment.endpoints.visitorsByOwner}`,
    UPDATE_VISITOR: `${environment.movementsApi}${environment.endpoints.updateVisitor}`,
    VEHICLE_TYPES: `${environment.movementsApi}${environment.endpoints.vehicleTypes}`,
    USERS_TYPE: `${environment.movementsApi}${environment.endpoints.usersType}`,
    GIVE_TEMP_RANGE: `${environment.movementsApi}${environment.endpoints.giveTempRange}`,
    USERS_ALLOWED_WITHOUT_MOVEMENTS: `${environment.movementsApi}${environment.endpoints.usersAllowedWithoutMovements}`,
    USERS_ALLOWED: `${environment.movementsApi}${environment.endpoints.usersAllowed}`,
    MOVEMENTS_ENTRY: `${environment.movementsApi}${environment.endpoints.movementsEntry}`,
    MOVEMENTS_EXIT: `${environment.movementsApi}${environment.endpoints.movementsExit}`,
    EMERGENCY_ENTRY: `${environment.movementsApi}${environment.endpoints.emergencyEntry}`,
    EMERGENCY_EXIT: `${environment.movementsApi}${environment.endpoints.emergencyExit}`
};