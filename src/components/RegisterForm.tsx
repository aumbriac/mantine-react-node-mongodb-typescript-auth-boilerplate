import { Box, TextInput, Group, Button, PasswordInput } from "@mantine/core"
import { useForm, UseFormReturnType } from '@mantine/form';
import axios from "axios";
import React, { FormEvent } from "react";
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconX } from "@tabler/icons";

export default function RegisterForm(){
  
    interface FormValues {
        email: string;
        password: string;
        confirmPassword: string;
    }

    const registerForm: UseFormReturnType<FormValues> = useForm({
        initialValues: {
          email: '',
          password: '',
          confirmPassword: ''
        },
        validate: {
          email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
          password: (value: string) => (value === registerForm.values.confirmPassword) ? null : true,
          confirmPassword: (value: string) => (value === registerForm.values.password) ? null : 'Passwords must match'
        },  
    })

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault()
        if (registerForm.validate().hasErrors){
          return 
        } else if (registerForm.values.password === '' || registerForm.values.confirmPassword === ''){
          registerForm.setFieldError('password', 'Password cannot be blank')
          registerForm.setFieldError('confirmPassword', 'Confirm password cannot be blank')
          return
        }
        const { data } = await axios.post('http://localhost:3001/register', registerForm.values)
        if (data.msg){
          showNotification({
            title: 'Error',
            color: 'red',
            icon: <IconAlertCircle />,
            message: data.msg,
          })
        } else {
          showNotification({
            title: 'Success',
            color: 'green',
            icon: <IconX />,
            message: 'You have successfully registered',
          })
        }
    }

    return <Box sx={{ maxWidth: 300 }} mx="auto">
    <form onSubmit={handleRegister}>
      <TextInput
        withAsterisk
        autoComplete="email"
        label="Email"
        placeholder="your@email.com"
        {...registerForm.getInputProps('email')}
      />
      <PasswordInput
        withAsterisk
        autoComplete="password"
        label="Password"
        {...registerForm.getInputProps('password')}
      />
      <PasswordInput
        withAsterisk
        autoComplete="confirmPassword"
        label="Confirm Password"
        {...registerForm.getInputProps('confirmPassword')}
      />
      <Group position="right" mt="md">
        <Button type="submit">Register</Button>
      </Group>
    </form>
  </Box>
}