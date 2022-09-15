import { useReducer } from "react"
import { AppContext } from "./AppContext"
import { AppReducer} from "./AppReducer"
import { useLocalStorage } from "@mantine/hooks"

export default function AppState(props){

    const [storage, setStorage] = useLocalStorage({
        key: "boilerplate",
        defaultValue: {
            accessToken: "",
            refreshToken: ""
        }
    })

    const initialState = {
        user: "",
        members: []
    }

    const [state, dispatch] = useReducer(AppReducer, initialState)

    return (
        <AppContext.Provider value={{ state, dispatch, storage, setStorage }}>
            {props.children}
        </AppContext.Provider>)
}