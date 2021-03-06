/**
 * Created by Indexyz on 2017/4/10.
 */
"use strict";
/**
 * Created by Indexyz on 2017/4/7.
 */
const Router = require('co-router');
let router = Router();

router.get("/login", require("./Login").get);
router.post("/login", require("./Login").post);

router.use("/register", function (req, res, next) {
    if (process.env['DISABLE_REGISTER'] === 'true'){
        return res.status(403).render("auth/disable");
    } else {
        return next()
    }
});

router.get("/register", require("./Register").get);
router.post("/register", require("./Register").post);
router.get("/resend", require("./Resend").get);
router.get("/email", require("./Mail").get);
router.get("/reset", require("./Reset").get);
router.post("/reset", require("./Reset").post);
router.get("/logout", require("./Logout").get);
module.exports = router;
