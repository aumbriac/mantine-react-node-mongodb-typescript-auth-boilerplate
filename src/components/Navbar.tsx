import { Text, Navbar as MantineNavbar, useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons";
import { useState } from "react";

export default function Navbar() {

    return (
        <MantineNavbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={false}
            width={{ sm: 100, lg: 200 }}
        >
            <Text>Application navbar</Text>
        </MantineNavbar>
    );
}
