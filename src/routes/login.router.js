import { Router } from 'express';
import passport from 'passport';

export const router=Router()

const auth2 = (req, res, next) => {
    if (req.session.usuario) {
        res.status(401).redirect('/api/perfil'); 
        return;
    }

    next();
};

router.get('/', auth2, (req, res) => {
    let { error, message, errorGithub } = req.query;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('login', { error, message, errorGithub, login: false });
});

// ESTRATEGIA DE AUTENTICACION CON GITHUB
router.get('/github', passport.authenticate('github',{}), (req,res)=>{})

router.get('/callbackGithub', passport.authenticate('github',{failureRedirect:"/api/login/errorGithub"}), (req,res)=>{
    
    console.log(req.user)
    req.session.usuario=req.user
    res.setHeader('Content-Type','application/json');
    res.status(200).redirect('/home');
});

router.get('/errorGithub',(req,res)=>{
    
    res.setHeader('Content-Type','application/json');
    res.status(200).json({
        error: "Error al autenticar con Github"
    });
});

// ESTRATEGIA DE AUTENTICACION LOCAL
router.get('/error',(req,res)=>{
    return res.redirect('/api/login?error=Error en el proceso de login... :(')
});

router.post('/', passport.authenticate('login', {failureRedirect: '/api/login/error'}),  async (req, res) => {
 
    console.log(req.user)
    req.session.usuario = {
        nombre: req.user.nombre,
        email: req.user.email,
        rol: req.user.rol
    };

    res.redirect('/home');
});

