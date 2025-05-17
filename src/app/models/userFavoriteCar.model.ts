import { Car } from "./car.model";
import { Users } from "./user.model";

export interface UserFavoriteCar{
    id:string,
    userId:	string,
    nullable: boolean,
    user:Users,
    carId:string,
    car:Car,
}
