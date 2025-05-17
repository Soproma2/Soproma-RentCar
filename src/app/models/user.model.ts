import { Message } from "./message.model"
import { UserFavoriteCar } from "./userFavoriteCar.model"

export interface Users{
    phoneNumber: string,
    email: string,
    passwordHash: string,
    passwordSalt: string,
    firstName: string,
    lastName: string,
    role: string,
    favoriteCars:UserFavoriteCar,
    message:Message
}