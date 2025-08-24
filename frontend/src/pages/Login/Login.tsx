import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { AUTH_URL } from "@/urls"

export default function Login() {

  const [email, setEmail] = useState<string>("")
  const [pword, SetPword] = useState<string>("")

  const navigate = useNavigate()
  
  return (
    <div className="w-full min-w-screen min-h-screen px-4 py-4 bg-gray-100/70 bg-clip-padding backdrop-filter backdrop-blur-sm border border-gray-100 text-gray-800">
        <div className="flex min-h-screen justify-center items-center">
            <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Toaster richColors position="top-center"/>
                <form>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            onChange={(e) => SetPword(e.target.value)}
                        />
                    </div>
                </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button 
                    type="submit" 
                    className="w-1/2"
                    onClick={async() => {
                        if(email === "" || pword === "") toast.error("Please fill all required fields")
                        try{
                            const res = await axios.post(`${AUTH_URL}/login`,
                                {
                                    "email": email,
                                    "password": pword
                                }
                            )
                            console.log(res.data)

                            // store token

                            const { access_token, expire, user_id } = res.data;
      
                            // Store token and expiration time in localStorage
                            localStorage.setItem('access_token', access_token);
                            localStorage.setItem('expire', expire);
                            localStorage.setItem('user_id', String(user_id));
                            
                            // Set JWT in axios headers
                            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                            navigate("/notes")
                        }
                        catch(error){
                            toast.error("Login Failed")
                            console.log(error)
                        }
                    }}
                >
                Login
                </Button>
                <Button 
                    type="submit" 
                    className="w-1/2"
                    onClick={() => {navigate("/register")}}
                >
                Sign Up
                </Button>
            </CardFooter>
            </Card>
        </div>
    </div>
  )
}
