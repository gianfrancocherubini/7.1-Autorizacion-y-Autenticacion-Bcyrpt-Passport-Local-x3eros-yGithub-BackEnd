import { Router } from 'express';
// import { UsuariosModelo } from '../dao/models/usuarios.model.js';
// import { creaHash  } from '../utils.js';
import passport from 'passport';

export const router=Router()

const auth2 = (req, res, next) => {
    if (req.session.usuario) {
        res.status(401).redirect('/api/perfil'); 
        return;
    }

    next();
};


router.get('/', auth2, async (req, res) => {
    let { errorMessage } = req.query;
    let { message } = req.query;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('registro', { errorMessage, message, login : false });   
});

router.get('/errorRegistro',(req,res)=>{
    return res.redirect('/api/registro?errorMessage=Error en el proceso de registro')
})


router.post('/', passport.authenticate('registro', {failureRedirect: '/api/registro/errorRegistro'}), async (req, res) => {
    
    let {email}=req.body
    res.redirect(`/api/login?message=Usuario ${email} registrado correctamente`)
    
});

