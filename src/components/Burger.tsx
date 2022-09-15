import { Burger as MantineBurger, MediaQuery } from "@mantine/core"
import { useState } from "react";

export default function Burger(){
    const [opened, setOpened] = useState(false);

    return (
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <MantineBurger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                mr="xl"
            />
        </MediaQuery>
    )
}