import { Employee } from "../schema/threadSchema.js";

export const toEmployeeDTO = (employee: any): Employee => {
    return {
        name: employee.name,
        email: employee.email ?? null,
    };
}