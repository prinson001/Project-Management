import { jwtDecode } from 'jwt-decode';
import useAuthStore from '../store/authStore';

const useAuth = () => {
    const token = useAuthStore((state) => state.token);
    let email = '';
    let isPM = false;
    let isPMO = false;
    let isDeputy = false;
    let isAdmin = false;
    let isUser = false;
    let status = 'Employee';
    let roles = '';

    if (token) {
        try {
            let decoded = jwtDecode(token);
            decoded = decoded.data;
            const { roles: decodedRoles, email: decodedEmail } = decoded;
            roles = decodedRoles || '';
            email = decodedEmail || '';

            isPM = roles === 'PM';
            isPMO = roles === 'PMO';
            isDeputy = roles === 'DEPUTY';
            isAdmin = roles === 'ADMIN';
            isUser = roles === 'USER';

            if (isPM) status = 'PM';
            if (isPMO) status = 'PMO';
            if (isDeputy) status = 'DEPUTY';
            if (isAdmin) status = 'ADMIN';
            if (isUser) status = 'USER';

            return { email, roles, status, isPM, isPMO, isDeputy, isAdmin, isUser, token };
        } catch (error) {
            console.error("Error decoding token:", error);
            return { email: '', roles: '', status: 'Employee', isPM: false, isPMO: false, isDeputy: false, isAdmin: false, isUser: false, token: null };
        }
    }

    return { email: '', roles: '', status: 'Employee', isPM: false, isPMO: false, isDeputy: false, isAdmin: false, isUser: false, token: null };
};

export default useAuth;