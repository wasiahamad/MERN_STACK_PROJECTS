import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Hero from "../landing_page/home/Hero";

describe("Hero Component", () => {
    test("Renders the Hero Component", () => {
        render(<Hero />);
        
        const heroImage = screen.getByAltText("Hero");
        expect(heroImage).toBeInTheDocument();
        expect(heroImage).toHaveAttribute("src", "media/image/homeHero.png");
    });

    test("Renders the Get Started Button", () => {
        render(<Hero />);
        
       const signUpButton = screen.getByRole("button", { name: "Get Started" });
        expect(signUpButton).toBeInTheDocument();
        expect(signUpButton).toHaveClass("btn-primary");
        
    });
});
