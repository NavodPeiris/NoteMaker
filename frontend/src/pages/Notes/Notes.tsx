import { useState } from 'react';
import Icon from "@/assets/icon.png";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NoteMaker from '@/components/NoteMaker/NoteMaker';
import { useEffect } from 'react';
import axios from 'axios';
import type { NoteItem } from '@/types/NoteItem';
import NoteCard from '@/components/NoteCard/NoteCard';
import { NOTE_CRUD_URL, AI_ANALYZE_URL } from '@/urls';
import { useNavigate } from 'react-router-dom';
import useNotes from '@/hooks/useNotes';
import { useQueryClient } from '@tanstack/react-query';
import { useToolStore } from '@/zustand_stores/tool_select_store';
import ToolBar from '@/components/ToolBar/ToolBar';
import GroupMaker from '@/components/GroupMaker/GroupMaker';
import KnowledgeGraph from '@/components/KnowledgeGraph/KnowledgeGraph';
import ChatBot from '@/components/Chatbot/Chatbot';
import ListedNote from '@/components/NoteCard/ListedNote';
import { useNoteSelect } from '@/zustand_stores/note_select_store';
import useKnowledgeGraph from '@/hooks/useKnowledgeGraph';
import useGroups from '@/hooks/useGroups';
import ComboBox from '@/components/ComboBox/ComboBox';
import { type listItem } from '@/types/ListItem';
import { useFilterGroup } from '@/zustand_stores/filter_group_store';
import { useFilterTags } from '@/zustand_stores/filter_tags_store';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

function Notes() {

  const navigate = useNavigate()

  const PAGE_SIZE = 10

  const [page, setPage] = useState(1)

  const user_id = Number(localStorage.getItem('user_id'));
  const toolSelected = useToolStore((tool) => tool.toolSelected)

  const tokenVerify = async() => {
    const token = localStorage.getItem('access_token');
    const tokenExpiration = localStorage.getItem('expire');

    if (token && tokenExpiration) {
      const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
      const expirationDate = new Date(tokenExpiration!).toISOString().split('T')[0];

      if (expirationDate < today) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('expire');
        console.log('Token expired and removed.');
        navigate("/login");
      }

      console.log("user logged in")
    }
    else {
      navigate("/login");
    }
  }

  useEffect(() => {
    tokenVerify()
  }, [navigate]);


  const { data: notesData, isLoading: notesLoading, error: notesError } = useNotes({page: page, pageSize: PAGE_SIZE, user_id: user_id})
  if(notesError) toast.error(notesError.message)

  const { data: kgData, isLoading: kgLoading, error: kgError } = useKnowledgeGraph({user_id: user_id})
  if(kgError) toast.error(kgError.message)

  const { data: groups, isLoading, error } = useGroups({user_id: user_id})
  if(error) toast.error(error.message)

  console.log("kgEdges: ", kgData?.kgEdges)

  let groupSelectList = groups?.map<listItem>((grp) => {
    return(
      {
        value: grp.title,
        label: grp.title
      }
    )
  })
  
  let notes = notesData?.notes
  let has_next = notesData?.has_next

  let tagSelectList = notes?.flatMap<listItem>((note) =>
    note.tags.map((tag) => ({
      value: tag,
      label: tag,
    }))
  );

  tagSelectList = tagSelectList? Array.from(new Map(tagSelectList.map(item => [item.value, item])).values()): [];

  const noteSelected = useNoteSelect((store) => store.noteSelected)

  let filterGroup = useFilterGroup((store) => store.filterGroup)
  let filterTag = useFilterTags((store) => store.filterTag)

  if(filterGroup !== undefined && filterTag !== undefined)
    notes = notes?.filter((note) => note.group.title === filterGroup && note.tags.includes(filterTag))

  if(filterGroup !== undefined)
    notes = notes?.filter((note) => note.group.title === filterGroup)

  if(filterTag !== undefined)
    notes = notes?.filter((note) => note.tags.includes(filterTag))

  return (
    <div className='w-full min-w-screen min-h-screen px-4 py-4 bg-gray-100/70 bg-clip-padding backdrop-filter backdrop-blur-sm border border-gray-100 text-gray-800'>
      <Toaster richColors position="top-center"/>
      <div className='flex justify-between items-center w-10/12 mx-auto p-2'>
          <div className='flex items-center gap-4'>
          <img src={Icon} className='size-12' />
          <p className='text-4xl'>Note Maker</p>
          </div>
          <div className='flex items-center gap-2'>
          <Button 
            type="submit"
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('expire');
              localStorage.removeItem('user_id');
              console.log('Token removed.');
              navigate("/");
            }}
          >
            Sign Out
          </Button>
          </div>
      </div>

      <Separator />

      <div className='flex w-10/12 mt-12 mx-auto p-2'>
        <NoteMaker />
        <GroupMaker />
      </div> 
      
      <div className='flex w-10/12 mt-4 mx-auto p-2'>
        <ToolBar/>
      </div>
      
      
      {toolSelected === "notes" && notes && !notesLoading ? (
        <div className="flex w-10/12 mt-4 mx-auto p-2 gap-2">
          <div className='flex-col w-full gap-2'>
            <div className='flex gap-2'>
              <ComboBox
                items={groupSelectList}
                comboPlaceholder="select group"
                searchPlaceholder="search group"
                searchNotFoundMsg="group not found"
                valueUsing="group"
              />

              <ComboBox
                items={tagSelectList}
                comboPlaceholder="select tag"
                searchPlaceholder="search tag"
                searchNotFoundMsg="tag not found"
                valueUsing="tag"
              />
            </div>
            
            <div className='flex'>
              <div className='flex-col w-1/3 gap-2'>
                {notes?.map((noteItem) => {
                  console.log("noteItem", noteItem)
                  if(noteItem){
                    return(
                      <ListedNote noteItem={noteItem}/>
                    )
                  }
                })}
                <div className='flex mt-2 justify-around items-center gap-4'>
                  <Button
                    onClick={() => {
                      setPage(page-1)
                    }}
                    disabled={page === 1}
                  >
                    Prev
                  </Button>
                  <Button
                    onClick={() => {
                      setPage(page+1)
                    }}
                    disabled={!has_next}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <div className='flex-col w-2/3 ml-2'>
                {noteSelected !== undefined ? (
                  <NoteCard noteItem={noteSelected}/>
                ): (<></>)}
              </div>
            </div>
          </div>
          
        </div>
      ): (<></>)}
      
      {toolSelected === "knowledge_graph" && (kgData?.kgNodes && kgData?.kgEdges) ? (
        <div className="flex w-10/12 my-12 mx-auto p-2">
          <KnowledgeGraph nodes={kgData.kgNodes} edges={kgData.kgEdges}/>
        </div>
      ): (<></>)}

      {toolSelected === "chat" ? (
        <div className="flex w-10/12 my-12 mx-auto p-2">
          <ChatBot/>
        </div>
      ): (<></>)}

    </div>
  )
}

export default Notes
