export default function IngredientsList(props) {
  const ingredientsListItems = props.ingredients.map((ingredient, index) => (
    <li key={index} className="ingredient-item">
      <span className="ingredient-name">{ingredient}</span>
      <button
        onClick={() => props.deleteIngredient(ingredient)}
        className="delete-button"
      >
        -
      </button>
    </li>
  ));
  return (
    <section>
      {/* NEW: Container for the ingredient list */}
      {props.ingredients.length > 0 && (
        <>
            <h2 className="ingredients-heading">Ingredients on hand:</h2>
              { props.ingredients.length <4 ? <div className='alert' style={
                {
                  color: '#e18a18ff',
                  fontWeight: '600',
                  fontSize: '14px',
                }
              }>Enter at least 4 ingredients</div> : ''}
            <div className="ingredients-box-wrapper">
            <div className="ingredients-container">
                <ul>{ingredientsListItems}</ul>
            </div>
            </div>
        </>
      )}

      {props.ingredients.length > 0 && (
        <div className="reset-button-wrapper">
          <button onClick={props.resetIngredients} className="reset-button">
            Clear All Ingredients
          </button>
        </div>
      )}
      {props.ingredients.length > 3 && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <button onClick={props.toggleRecipeShown}>Get a recipe</button>
        </div>
      )}
    </section>
  );
}
