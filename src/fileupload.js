import React, { Component } from 'react';

import { FilePond, registerPlugin,File} from "react-filepond";

//import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";


import firebase from 'firebase'
import MyStore from '../config/store'
import React, { useState, useEffect } from 'react';
import { FilePond, registerPlugin, File } from "react-filepond";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import { storage, firestore } from '../config/firebase'; // Assuming you have a separate file for Firebase configuration
registerPlugin(FilePondPluginImagePreview);
class fileshare extends Component{

    
  constructor(props) {
    registerPlugin(FilePondPluginImagePreview);

    const FileShare = () => {
        const [files, setFiles] = useState([]);
        const [uploadValue, setUploadValue] = useState(0);
        const [filesMetadata, setFilesMetadata] = useState([]);
        const [rows, setRows] = useState([]);
        const [message, setMessage] = useState('');

        const storageRef = storage.ref();
        const databaseRef = firestore.collection('files');

        const handleProcessing = (fieldName, file, metadata, load, error, progress, abort) => {
            console.log("handle file upload here");
            console.log(storageRef.child(file.name).fullPath);

            const fileUpload = file;

            const task = storageRef.child(file.name).put(fileUpload);

            task.on(`state_changed`, (snapshot) => {
                console.log(snapshot.bytesTransferred, snapshot.totalBytes);
                let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadValue(percentage);
            }, (error) => {
                setMessage(`Upload error: ${error.message}`);
            }, () => {
                setMessage('Upload Success');
                // Get metadata
                storageRef.child(file.name).getMetadata().then((metadata) => {
                    storageRef.child(file.name).getDownloadURL().then(url => {
                        console.log(url);
                        let metadataFile = {
                            name: metadata.name,
                            size: metadata.size,
                            contentType: metadata.contentType,
                            fullPath: metadata.fullPath,
                            downloadURL: url
                        };

                        // Process save metadata
                        databaseRef.doc(uid).collection("files").add(metadataFile);
                        databaseRef.doc(uid).collection("log").add({
                            action: `${file.name} uploaded`,
                            timestamp: new Date()
                        });
                    });
                    alert("Uploaded Successfully");
                }).catch(function (error) {
                    console.log(error);
                });
            });
        };

        const handleInit = () => {
            console.log("FilePond instance has initialised", pond);
        };

        return (
            <div className="fileshare">
                <FilePond
                    ref={ref => (pond = ref)}
                    files={files}
                    allowMultiple={true}
                    maxFiles={3}
                    server={{ process: handleProcessing }}
                    oninit={() => handleInit()}
                >
                    {files.map(file => (
                        <File key={file} source={file} />
                    ))}
                </FilePond>
            </div>
        );
    };

    export default FileShare;
    this.storageRef = MyStore.storage().ref();
    this.databaseRef = MyStore.database().ref();
  }
    state  = {
        files : [], // is used to store file upload information
        uploadValue :  0 , // Used to view the process. Upload
        filesMetadata : [], // Used to receive metadata from Firebase.
        rows :   [], // draw the DataTable
        messag:''
    }

    
  handleProcessing(fieldName, file, metadata, load, error, progress, abort) {
    // handle file upload here
    console.log(" handle file upload here");
    console.log(this.storageRef.child(file.name).fullPath);

    const fileUpload = file;
    
    const task = this.storageRef.child(file.name).put(fileUpload)

    task.on(`state_changed` , (snapshort) => {
        console.log(snapshort.bytesTransferred, snapshort.totalBytes)
        let percentage = (snapshort.bytesTransferred / snapshort.totalBytes) * 100;
        //Process
        this.setState({
            uploadValue:percentage
        })
    } , (error) => {
        //Error
        this.setState({
            messag:`Upload error : ${error.message}`
        })
    } , () => {
        //Success
        this.setState({
            messag:`Upload Success`,
            picture: task.snapshot.downloadURL //เผื่อนำไปใช้ต่อในการแสดงรูปที่ Upload ไป
        })

        //Get metadata
        this.storageRef.child(file.name).getMetadata().then((metadata) => {
          // Metadata now contains the metadata for 'filepond/${file.name}'
          let downloadURL = ''
          this.storageRef.child(file.name).getDownloadURL().then( url =>{
            console.log(url)
            let metadataFile = { 
              name: metadata.name, 
              size: metadata.size, 
              contentType: metadata.contentType, 
              fullPath: metadata.fullPath,
              downloadURL:url
                       
          }

          //Process save metadata
  
          this.databaseRef.child(this.props.uid).child("files").push({  metadataFile });
          this.databaseRef.child(this.props.uid).child("log").push().set({
            action:`${file.name} uploaded`,
            timestamp:new Date()
          });
          })
         alert("Uploaded Successfully")

      }).catch(function(error) {
        console.log(error)
      });
    })
}
  handleInit() {
    console.log("FilePond instance has initialised", this.pond);
  }

    render(){

        return(
            <div className="fileshare">
                        <FilePond
                          ref={ref => (this.pond = ref)}
                          files={this.state.files}
                          allowMultiple={true}
                          maxFiles={3}
                          server = {{process :  this . handleProcessing . bind ( this  )}}
                          oninit={() => this.handleInit()}
                        
                        >
                          { this.state.files.map(file=> (
                                <File key = {file} source = {file} />
                              ))}
                        </FilePond>
            </div>
        )
    }
}

export default FileUpload;