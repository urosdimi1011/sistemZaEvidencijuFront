import { Spinner } from "@fluentui/react-components";
import {Navigate, useLocation, useNavigate} from 'react-router';
import {useAuth} from "../Provides/AuthProvider";
import {useEffect} from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'school_manager' | 'korisnik';
    requiredPermission?: string;
    requireSchoolAccess?: boolean;
    fallbackPath?: string;
}

export default function ProtectedRoute({
                                           children,
                                           requiredRole,
                                           requiredPermission,
                                           requireSchoolAccess = false,
                                           fallbackPath = '/login'
                                       }: ProtectedRouteProps) {
    const { currentUser, authLoading, canAccessResource, hasPermission } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/login', {
                state: { from: location },
                replace: true
            });
        }
        else if(authLoading && currentUser?.role === 'school_manager'){
            navigate('/ucenici');
        }
    }, [currentUser, authLoading, navigate, location]);
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="large" />
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to={fallbackPath} replace />;
    }

    if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">
                        Nemate dozvolu
                    </h2>
                    <p className="text-gray-500">
                        Potrebna je uloga: {requiredRole}
                    </p>
                </div>
            </div>
        );
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">
                        Nemate dozvolu
                    </h2>
                    <p className="text-gray-500">
                        Potrebna dozvola: {requiredPermission}
                    </p>
                </div>
            </div>
        );
    }

    if (requireSchoolAccess && !canAccessResource()) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">
                        Nemate pristup
                    </h2>
                    <p className="text-gray-500">
                        Niste povezani ni sa jednom školom.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export function usePermissions() {
    const { currentUser, hasPermission, canAccessResource } = useAuth();

    return {
        isAdmin: currentUser?.role === 'admin',
        isSchoolManager: currentUser?.role === 'school_manager',
        canManageStudents: hasPermission('manage_students'),
        canManageManagers: hasPermission('manage_managers'),
        canViewManagerData: hasPermission('view_manager_data'),
        canManagePayments: hasPermission('manage_payments'),
        canViewAllSchools: hasPermission('view_all_schools'),
        canManageOccupations: hasPermission('manage_occupations'),
        canAccessSchoolResources: canAccessResource(),
        schoolId: currentUser?.schoolId,
        schoolName: currentUser?.school?.name
    };
}