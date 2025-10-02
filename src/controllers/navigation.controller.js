const { sendSuccess } = require('../utils/response');

const getNavigation = async (req, res, next) => {
    try {
        const navigation = [
            {
                id: 'home',
                label: 'Home',
                icon: 'fas fa-home',
                path: '/home',
                component: 'HomeComponent'
            },
            {
                id: 'projects',
                label: 'Projects',
                icon: 'fas fa-briefcase',
                path: '/projects',
                component: 'ProjectsComponent'
            },
            {
                id: 'about',
                label: 'About',
                icon: 'fas fa-user',
                path: '/about',
                component: 'AboutComponent'
            },
            {
                id: 'contact',
                label: 'Contact',
                icon: 'fas fa-envelope',
                path: '/contact',
                component: 'ContactComponent'
            }
        ];

        sendSuccess(res, navigation, 'Navigation data retrieved successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNavigation
};