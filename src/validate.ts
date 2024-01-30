import { Ok, Result } from "./lib/result"

type ValidateInput = {
    filePaths: string[]
    publish?: boolean
}


/*
for each file:
    check if file exists
    check if file is a json file
    check if file is a valid exercise json file
*/


export function validate({ filePaths, publish = false }: ValidateInput): Result<"ok", string> {
    return Ok("ok")
}