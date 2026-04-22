import { Navigate } from "react-router-dom";

/**
 * Пази route-овете от неавтентикиран достъп.
 * Ако user-ът не е влязъл (няма `username` в localStorage) — праща го на /.
 * По избор може да ограничи достъпа и по роля: <ProtectedRoute roles={["ADMIN"]}/>.
 *
 * Не пречи на съществуващите страници — те продължават да четат
 * localStorage.getItem("username") / ("role") както преди.
 */
export default function ProtectedRoute({ children, roles }) {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!username) {
        return <Navigate to="/" replace />;
    }

    if (roles && !roles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
