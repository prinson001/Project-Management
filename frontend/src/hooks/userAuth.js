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
    let role = '';

    if (token) {
        try {
            console.log('token in auth', token)
            let decoded = jwtDecode(token);

            decoded=decoded.userData;
            const { role: decodedRoles, email: decodedEmail } = decoded;
            role = decodedRoles || '';
            email = decodedEmail || '';

            isPM = role === 'PM';
            isPMO = role === 'PMO';
            isDeputy = role === 'DEPUTY';
            isAdmin = role === 'ADMIN';
            isUser = role === 'USER';

            if (isPM) status = 'PM';
            if (isPMO) status = 'PMO';
            if (isDeputy) status = 'DEPUTY';
            if (isAdmin) status = 'ADMIN';
            if (isUser) status = 'USER';

            return { email, role, status, isPM, isPMO, isDeputy, isAdmin, isUser, token };
        } catch (error) {
            console.error("Error decoding token:", error);
            return { email: '', role: '', status: 'Employee', isPM: false, isPMO: false, isDeputy: false, isAdmin: false, isUser: false, token: null };
        }
    }

    return { email: '', role: '', status: 'Employee', isPM: false, isPMO: false, isDeputy: false, isAdmin: false, isUser: false, token: null };
};

export default useAuth;