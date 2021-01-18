var default_args = {
    "filters": [],
    "skills": [
        {
            "skillCategory": "Languages",
            "limit": 99,
            "subSkills": {
                "Python": 10,
                "SQL": 9,
                "Snowflake": 9,
                "Javascript": 8,
                "C++": 7,
                "JSON": 7,
                "HTML": 6,
                "CSS": 6,
                "Matlab": 6,
                "Java": 5,
                "YAML": 5,
                "Scheme (Lisp)": 5,
                "C": 4,
                "Jinja": 4,
                "Lua": 3,
                "RISC-V": 2,
            }
        }
    ]
}

console.log(default_args);

// UPDATE ARGS AS NEED BE
var args = default_args;

var skills = args.skills;
for (let i = 0; i < skills.length; i++) {
    var skill = skills[i];
    console.log(skill);

    // Sort Dictionary a la https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
    var items = Object.keys(skill.subSkills).map(function(key) {
      return [key, skill.subSkills[key]];
    });
    // Sort the array based on the second element
    items.sort(function(first, second) {
      return second[1] - first[1];
    });

    // Create a new array with only the first 5 items
    items = items.slice(0, skill.limit);
    items = items.map(function(item) {
        return item[0]
    });
    console.log(items);


    // MAKE HTML ELEMS
    var skillDiv = document.createElement("div");
    console.log(skillDiv);
    var title = document.createElement("h3");
    title.innerHTML = skill.skillCategory;
    var content = document.createElement("a");
    content.innerHTML = items.join(", ");

    skillDiv.appendChild(title);
    skillDiv.appendChild(content);



    var skillsBox = document.getElementById("skillsbox");
    console.log(skillsBox);
    skillsBox.appendChild(skillDiv);


}