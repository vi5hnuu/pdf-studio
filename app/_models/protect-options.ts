import {Property} from "csstype";
import {Font, UserPermission} from "@/app/_utils/constants";


export interface ProtectOptions {
    out_file_name:string;
    owner_password:string;
    user_password:string;
    userAccess_permissions:Set<UserPermission>;//empty means user has owner permission
}
