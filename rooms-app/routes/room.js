const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

//show all rooms
router.get("/", (req, res, next) => {
        const user = req.user;
        console.log("infor ", user)
        Room
                .find({})
                .populate("owner", "fullName")
                .then((rooms) => {
                        res.render("rooms/rooms", { rooms, user })
                })
                .catch(err => next(err))
})

//add rooms
router.get('/add', (req, res) => {
        res.render("rooms/addRoom");
})
//edit rooms
router.get('/edit/:id', (req, res, next) => {
        console.log(req.isAuthenticated(), req.user)
        if (req.isAuthenticated()) {
                Room
                        .findById(req.params.id)
                        .then((room) => {
                                // console.log((req.user._id ).toString() === (room.owner).toString())
                                if ((req.user._id).toString() === (room.owner).toString()) {
                                        res.render("rooms/editRoom", { room })
                                } else { res.render("rooms/editRoom", { message: "You are not allowed to edit this room!" }) }
                        })
                        .catch(err => next(err));
        }
})

//delete rooms
router.get("/delete/:id", (req, res, next) => {
        // if (req.isAuthenticated()) {
        //         Room
        //                 .findOneAndDelete(req.params.id)
        //                 .then(() => { res.redirect("/rooms") })
        //                 .catch((err) => { next(err); });
        // }
        if (req.isAuthenticated()) {
                Room
                        .findById(req.params.id)
                        .then((room) => {
                                if ((req.user._id).toString() === (room.owner).toString()) {
                                        console.log("check----------")
                                        Room
                                                .remove(room)
                                                .then((rooms) => res.redirect("/rooms"))
                                                .catch(err => next(err))

                                } else { res.redirect("/rooms") }
                        })
                        .catch(err => next(err));
        }

});

router.post("/add", (req, res, next) => {
        const { name, description, imageUrl } = req.body;
        // console.log(req.isAuthenticated(), req.user)
        if (!req.isAuthenticated()) {
                res.redirect("/");
                return;
        }
        Room
                .create({
                        name: name,
                        description: description,
                        imageUrl: imageUrl,
                        owner: req.user._id,
                })
                .then((room) => { res.redirect("/rooms") })
                .catch((err) => next(err))
});

router.post("/edit/:id", (req, res, next) => {
        const { name, description, imageUrl } = req.body;
        // console.log(req.body)
        // console.log(req.isAuthenticated(), req.user)
        if (req.isAuthenticated()) {
                Room.findByIdAndUpdate(req.params.id, req.body, { new: true })
        }
})

module.exports = router;