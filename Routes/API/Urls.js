/**
 * Created by Indexyz on 2017/4/11.
 */
'use strict';

const express = require('express');
let router = express.Router();

router.use("/mojang", require("./Mojang/Urls"));
router.use("/server", require("./Server/Urls"));

module.exports = router;