package com.echotrace;

import com.echotrace.repository.TestRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
		org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
})
@EnableMongoAuditing
@EnableScheduling
@RequiredArgsConstructor
public class EchoTraceApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(EchoTraceApplication.class, args);
	}

	@Override
	public void run(String... args) {
		System.out.println("Application Started successfully");
	}
}