// import Appointment from '../../client/src/components/Appointment.js';
import Appointment from './models/appointment.js';
import User from './models/user.js'
// import { createAppointment } from './resolvers/Mutation.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const resolvers = {
    Query: {
        async allAppointments() {
            return await Appointment.find({ deleted: false })
            // return await Appointment.find();
        },
        async oneAppointment(root, args, context, info) {
            return await Appointment.findOne({
                _id: args._id
            });
        },
        async allUsers() {
            return await User.find();
        },
    },
    Mutation: {
        async signup(root, args, context, info) {
            var user = await User.create(args);
            user.password = user.generateHash(args.password);
            user.save();

            const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

            return {
                token,
                user
            };
        },

        async login(parent, args, context, info) {
            console.log(context);
            const { userId } = context;
            console.log(userId);

            const user = await User.findOne({
                email: args.email
            });
            if (!user) {
                throw new Error('No such user found');
            }

            if (!user.validPassword(args.password)) {
                throw new Error('Invalid password');
            }

            const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

            return {
                token,
                user
            };
        },

        async createAppointment(parent, args, context, info) {
            console.log(context);
            const { userId } = context;
            console.log("userID", userId);
            args.deleted = false;
            args.createdBy = userId;
            return await Appointment.create(args);
        },
        async updateAppointment(parent, args, context, info) {
            console.log(args);
            return await Appointment.findOneAndUpdate({
                args
            }, args, {
                new: true
            });
        }
    }
};