import {useAuth} from "../../Provides/AuthProvider";
import {Navigate} from "react-router";

export default function ReverseProtectedRoute({ children }) {
    const { token, currentUser } = useAuth();

    // Ako je korisnik već ulogovan, redirektuj ga na početnu stranu
    if (token && currentUser) {
        return <Navigate to="/" replace />;
    }

    // Inače, prikaži traženu stranicu (login)
    return children;
}