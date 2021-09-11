import React, { createRef } from "react";
import {withRouter} from "react-router"

import {connect, disconnect} from "../../sockets/socket";

import Quill from "quill";
import "quill/dist/quill.snow.css";

import "./text-editor.styles.css";

const TOOLBAR_OPTIONS = [

    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    ['image', 'blockquote', 'code-block'],

    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript

    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean']                                         // remove formatting button
];

const SAVE_INTERVAL_MS = 2000;
const MOUSE_INTERVAL_MS = 500;

class TextEditor extends React.Component {

    constructor(props){
        super(props);
        this.wrapperEditorRef = createRef();
        

        this.state = {
            socket : null,
            quill : null
        }

        this.saveInDBInterval = null;
        this.updateMouseTrackerInterval = null;
    }


    createEditor(){
        const editor = document.createElement('div');
        this.wrapperEditorRef.current.append(editor);
        
        let q = new Quill(editor, 
            {
                modules : {
                    toolbar : TOOLBAR_OPTIONS
                },
                theme : 'snow'
            }
        );

        q.disable();
        q.setText('Loading...')
        this.setState({quill : q});
    }

    editorOnChange = (delta, oldDelta, source)=>{
        if (source !== 'user') return
        this.state.socket.emit("send-changes", delta)
    }
    receiveChanges = (delta) => {
        this.state.quill.updateContents(delta);
    }

    saveDocument = () => {
    }

    componentDidMount(){
        this.createEditor();
        let s = connect();
        this.setState({socket : s});

        const {quill} = {...this.state}
        if(quill && this.state.socket){
            quill.on("text-change", this.editorOnChange);
        }

        

        return ()=> { this.wrapperEditorRef.current.innerHTML = ""}
    }

    componentDidUpdate(){
        const {quill, socket} = {...this.state}
        const {match} = {...this.props}
        const documentId = match.params.id;
        if(quill && socket){
            
            quill.on("text-change", this.editorOnChange)
            
            socket.on("receive-changes", this.receiveChanges)
            
            socket.once("load-document", document => {
                quill.setContents(document);
                quill.enable();
            })
            
            socket.emit("get-document", documentId);

            this.saveInDBInterval = setInterval(()=> {
                socket.emit("save-document", quill.getContents())
            }, SAVE_INTERVAL_MS)

            this.updateMouseTrackerInterval = setInterval(()=> {

            }, MOUSE_INTERVAL_MS)

        }

        
    }

    componentWillUnmount(){
        const {quill, socket} = {...this.state}
        if (socket){
            disconnect(socket);
            socket.off("receive-changes", this.receiveChanges)
        }
        if(quill){
            quill.off("text-change", this.editorOnChange)
        }
        if(this.saveInDBInterval) clearInterval(this.saveInDBInterval);
        if(this.updateMouseTrackerInterval) clearInterval(this.updateMouseTrackerInterval);
        
    }
    render(){
        
        return(
            <div className="container-editor" ref={this.wrapperEditorRef}></div>
        );
    }
}

export default withRouter(TextEditor);
