
// Utility: Create Recipe Card

function createRecipeCard(meal) {
    const card = document.createElement('div');
    card.classList.add('recipe-card');

    const randomRating = (Math.random() * 4 + 1).toFixed(1);
    let ratingHtml = `<div class="rating" data-id="${meal.idMeal}">`;
    for (let i = 1; i <= 5; i++) {
        ratingHtml += `<span class="star" data-value="${i}" style="color:${i <= Math.round(randomRating) ? '#ffd700' : '#ccc'}">&#9733;</span>`;
    }
    ratingHtml += `<span class="rating-number" style="margin-left:8px;font-weight:600;color:#e52e71;">${randomRating}/5</span></div>`;

    // Check if this meal is already a favorite
    let favs = [];
    try {
        favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {}
    const isFav = favs.some(f => f.id === meal.idMeal);
    const heart = isFav ? '♥' : '♡';
    const heartColor = isFav ? '#ffd700' : '#e52e71';
    const heartTitle = isFav ? 'Remove from Favorites' : 'Add to Favorites';
    card.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h3>${meal.strMeal}</h3>
        <button class="fav-btn" data-id="${meal.idMeal}" data-title="${meal.strMeal}" data-thumb="${meal.strMealThumb}" style="background:none;border:none;cursor:pointer;font-size:1.5rem;color:${heartColor};float:right;" title="${heartTitle}">${heart}</button>
        <div class="nutrition-info">
            <strong>Nutritional Info:</strong><br>
            Calories: 250 kcal<br>
            Protein: 12g<br>
            Fat: 8g<br>
            Carbs: 30g<br>
        </div>
        ${ratingHtml}
        <button onclick="viewRecipes('${meal.idMeal}')">View Recipe</button>
    `;
    return card;
}


// Search by Category

function searchCategory(category) {
    const recipesDiv = document.getElementById('recipes');
    const notFoundDiv = document.getElementById('notFound');
    recipesDiv.innerHTML = "";
    notFoundDiv.style.display = "none";

    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        .then(response => response.json())
        .then(data => {
            if (!data.meals) {
                notFoundDiv.innerHTML = `No ${category} recipes found.`;
                notFoundDiv.style.display = "block";
                return;
            }
            data.meals.forEach(meal => {
                const card = createRecipeCard(meal);
                recipesDiv.appendChild(card);
            });
        })
        .catch(error => {
            notFoundDiv.innerHTML = "An error occurred while fetching recipes.";
            notFoundDiv.style.display = "block";
            console.error("Fetch error:", error);
        });
}

// Search by Recipe Name
function searchRecipes() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const recipesDiv = document.getElementById('recipes');
    const notFoundDiv = document.getElementById('notFound');

    recipesDiv.innerHTML = "";
    notFoundDiv.style.display = "none";

    if (searchInput === "") {
        notFoundDiv.innerHTML = "Please enter a search term!";
        notFoundDiv.style.display = "block";
        return;
    }

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput}`)
        .then(response => response.json())
        .then(data => {
            if (!data.meals) {
                notFoundDiv.innerHTML = "No recipes found. Please try again!";
                notFoundDiv.style.display = "block";
                return;
            }
            data.meals.forEach(meal => {
                const card = createRecipeCard(meal);
                recipesDiv.appendChild(card);
            });
        })
        .catch(error => {
            notFoundDiv.innerHTML = "An error occurred while fetching recipes.";
            notFoundDiv.style.display = "block";
            console.error("Fetch error:", error);
        });
}


// Render Favorites



// Event: Star Rating Click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('star')) {
        const ratingDiv = e.target.parentElement;
        const stars = ratingDiv.querySelectorAll('.star');
        const value = parseInt(e.target.getAttribute('data-value'));

        stars.forEach((star, idx) => {
            star.style.color = idx < value ? '#ffd700' : '#ccc';
        });

        // Optional: Save rating locally or remotely
    }
});


// Placeholder for viewRecipes()
function viewRecipes(id) {
    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalContent');

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(res => res.json())
        .then(data => {
            const meal = data.meals[0];

            // Generate ingredients list
            let ingredients = '';
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== '') {
                    ingredients += `<li>${measure} ${ingredient}</li>`;
                }
            }

            modalContent.innerHTML = `
                <h2>${meal.strMeal}</h2>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:100%;border-radius:8px;margin-bottom:10px;">
                <p><strong>Category:</strong> ${meal.strCategory}</p>
                <p><strong>Area:</strong> ${meal.strArea}</p>
                <p><strong>Tags:</strong> ${meal.strTags || 'None'}</p>
                <h3>Ingredients:</h3>
                <ul>${ingredients}</ul>
                <h3>Instructions:</h3>
                <p style="white-space:pre-wrap;">${meal.strInstructions}</p>
                ${meal.strYoutube ? `<p><a href="${meal.strYoutube}" target="_blank" style="color:#e52e71;">▶ Watch on YouTube</a></p>` : ''}
            `;

            modal.style.display = 'flex';
        })
        .catch(error => {
            modalContent.innerHTML = `<p style="color:red;">Failed to load recipe details.</p>`;
            modal.style.display = 'flex';
            console.error(error);
        });
}
// Close modal when clicking X
document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('recipeModal').style.display = 'none';
});

// Close modal when clicking outside content
window.addEventListener('click', function (e) {
    const modal = document.getElementById('recipeModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

