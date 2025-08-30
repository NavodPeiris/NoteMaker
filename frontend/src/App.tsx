import Icon from "./assets/icon.png";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Landing from "@/pages/Landing/Landing";
import { useNavigate } from 'react-router-dom';

function App() {

  const navigate = useNavigate()

  return (
    <div className='w-full min-w-screen min-h-screen px-4 py-4 bg-gray-100/70 bg-clip-padding backdrop-filter backdrop-blur-sm border border-gray-100 text-gray-800'>
      
      <div className='flex w-full min-w-screen justify-center'>
        <div className='flex p-2 justify-between w-10/12'>
          <div className='flex justify-start content-center items-center gap-4'>
            <img src={Icon} className='size-12'/>
            <p className='flex text-4xl justify-start content-center items-center'>Note Maker</p>
          </div>
          <div className='flex justify-evenly content-center items-center gap-2'>
            <Button type="submit" onClick={() => {navigate("/register")}}>Sign Up</Button>
            <Button type="submit" onClick={() => {navigate("/login")}}>Login</Button>
          </div>
        </div>
      </div>
      <Separator/>
      
      <Landing/>
      
    </div>
  )
}

export default App
