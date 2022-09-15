import { Header as MantineHeader, Text } from "@mantine/core"
import Burger from "./Burger"
import ThemeToggle from "./ThemeToggle"

export default function Header(){
    return (
        <MantineHeader height={70} p="md">
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                <Burger />
                <Text>Application header</Text>&emsp;
                <ThemeToggle />
            </div>
        </MantineHeader>
    )
}