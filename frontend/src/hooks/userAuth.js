import { jwtDecode } from 'jwt-decode';
import useAuthStore from '../store/authStore';

const useAuth = () => {
    const token = useAuthStore((state) => state.token);
    console.log('token in userAuth', token);
    let isPM = false;
    let isPMO = false;
    let isDeputy = false;
    let isAdmin = false;
    let isUser = false;

    let status = 'Employee';
    let roles = '';
    console.log('token before if', token);
    if (token) {
        let decoded = jwtDecode(token);
        console.log('decoded', decoded);
        decoded = decoded.data;
        const { email, roles: decodedRoles } = decoded;
        console.log('decoded', decoded);
        roles = decodedRoles || '';

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
        console.log(email, roles, status, isPM, isPMO, isDeputy, isAdmin, isUser);
        return { email, roles, status, isPM, isPMO, isDeputy, isAdmin, isUser };
    }
    return { email: '', roles, isPM, isPMO, isDeputy, isAdmin, isUser, status };
};

export default useAuth;