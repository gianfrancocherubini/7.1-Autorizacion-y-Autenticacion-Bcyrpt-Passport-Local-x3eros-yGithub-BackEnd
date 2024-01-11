import { Router } from 'express';

export const router=Router()
// hago el middle para proteger la ruta perfil si es que el usuario no hizo el loguin
const auth = (req, res, next) => {
    if (!req.session.usuario) {
        res.status(401).redirect('/api/login'); 
        return;
    }

    next();
};

const auth2 = (req, res, next) => {
    if (req.session.usuario) {
        res.status(401).redirect('/api/perfil'); 
        return;
    }

    next();
};

router.get('/', auth, (req, res) => {
    let usuario = req.session.usuario;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('perfil', { usuario, login: true });
});

