import { div } from "framer-motion/client";
import { NoteCard3D } from "@/components/NoteCard3D/NoteCard3D";
import ImageCarousel from "@/components/ImageCarousel/ImageCarousel";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Landing(){

    const navigate = useNavigate()

    const tokenVerify = async() => {
        const token = localStorage.getItem('access_token');
        const tokenExpiration = localStorage.getItem('expire');

        const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
        
        if(token && tokenExpiration){
            const expirationDate = new Date(tokenExpiration!).toISOString().split('T')[0];
            if (expirationDate < today) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('expire');
                console.log('Token expired and removed.');
            }
            else{
                console.log("user logged in")
                navigate("/notes");
            }     
        }
    }

    useEffect(() => {
        tokenVerify()
    }, [navigate]);

    return(
        <div className="flex flex-col h-screen justify-start content-center items-center gap-10">
            <ImageCarousel/>
            <div className="flex h-1/4 justify-center content-center items-center gap-10">
                <div className="flex flex-col max-w-6/12 items-ceter justify-center content-center gap-4">
                    <span className="sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium"><b>Note Maker: </b>Not Your Average Notes App</span>
                    <span className="font-medium text-sky-500">Notes Done Right</span>
                    <br />
                    <p className="font-medium">
                        Write any note with style and organize according to your needs using note groups and tags
                    </p>
                </div>
                <NoteCard3D/>
            </div>  
        </div>
    )
}

export default Landing;