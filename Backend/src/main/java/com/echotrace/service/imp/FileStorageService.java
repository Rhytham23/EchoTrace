package com.echotrace.service.imp;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path uploadDir = Paths.get("src/main/resources/static/uploads");

    public FileStorageService() {
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize uploads folder", e);
        }
    }

    public String saveFile(MultipartFile file) {
        try {
            String originalFileName = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String newFileName = UUID.randomUUID().toString() + "." + fileExtension;

            Path targetPath = uploadDir.resolve(newFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return newFileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private String getFileExtension(String filename) {
            if (filename == null || !filename.contains(".")) {
                throw new RuntimeException("Filename is null"); // or throw an exception
            }
            return filename.substring(filename.lastIndexOf(".") + 1);
        }



    public Path loadFile(String filename){
        return uploadDir.resolve(filename)
                .normalize();
    }

    public void deleteFile(String filename){
        try{
            Path filePath = uploadDir.resolve(filename).normalize();
            if(Files.exists(filePath)){
                Files.delete(filePath);
            }else{
                throw new IOException("File not found: " + filename);
            }
        }catch (IOException e){
            throw new RuntimeException("Failed to delete file: " + filename);
        }
    }

}