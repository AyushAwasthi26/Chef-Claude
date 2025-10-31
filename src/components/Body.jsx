import React, { useState, useCallback, useEffect, useRef } from "react";
import IngredientsList from "./IngredientsList";
import RecipeDisplay from "./RecipeDisplay"; 
import { getRecipeFromGemini } from "../ai"; 

export default function Body() {
  const [ingredients, setIngredients] = useState([]);
  const [recipeShown, setRecipeShown] = useState(false); 
  
  // States for API fetching
  const [recipeMarkdown, setRecipeMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function deleteIngredient(ingredientToDelete) {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((ingredient) => ingredient !== ingredientToDelete)
    );
    setRecipeMarkdown(""); 
    setRecipeShown(false); 
  }

  // API fetching logic wrapped in useCallback
  const getRecipes = useCallback(async () => {
    if (ingredients.length < 4) return;
    
    setIsLoading(true);
    setError(null);
    setRecipeShown(true); 
    setRecipeMarkdown("");

    try {
      const markdown = await getRecipeFromGemini(ingredients);
      setRecipeMarkdown(markdown);
    } catch (err) {
      setError(err.message || "Failed to fetch recipe.");
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]); 

  function toggleRecipeShown() {
    getRecipes(); 
  }

  function resetIngredients() {
    setIngredients([]);
    setRecipeShown(false);
    setRecipeMarkdown("");
    setError(null);
  }

  const recipeSection=useRef(null)

  useEffect(()=>{
    if (recipeMarkdown!=='' && recipeSection.current!==null) {
      recipeSection.current.scrollIntoView({behavior: "smooth"})
    }
  },[recipeMarkdown])
  

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newIngredient = formData.get("ingredient");
    
    if (newIngredient.trim() === "") return;
    
    setIngredients((prevIngredients) => [
      ...prevIngredients,
      newIngredient.trim(),
    ]);
    
    event.currentTarget.reset();
  }

  return (
    <main>
      <form onSubmit={handleSubmit} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button>Add ingredient</button>
      </form>
      
      <IngredientsList
        ingredients={ingredients}
        resetIngredients={resetIngredients}
        toggleRecipeShown={toggleRecipeShown}
        deleteIngredient={deleteIngredient}
      />
      
      {/* Conditional recipe display */}
      {recipeShown && (
        <section className="recipe-section" ref={recipeSection}>
          <h2 className="recipe-section-heading">Chef Claude's Recommendation:</h2>
          
          {isLoading && <p>Cooking up one delicious idea... 🍳</p>}
          
          {error && <p className="error-message">Error: {error}</p>}
          
          {/* Display Markdown content */}
          {!isLoading && !error && recipeMarkdown && (
              <>
                <RecipeDisplay markdown={recipeMarkdown} />
                {/* Reset button only shown when recipe is displayed */}
                <div className="recipe-reset-wrapper">
                  <button onClick={resetIngredients} className="recipe-reset-button">
                    Start Over
                  </button>
                </div>
              </>
          )}

          {/* Prompt if no results */}
          {!isLoading && !error && !recipeMarkdown && ingredients.length >= 4 && <p>Click "Get a recipe" to try again.</p>}
        </section>
      )}
    </main>
  );
}