function getSuggestions() {
    axios
        .get("/api/suggestions")
        .then((response) => {
            const { data } = response.data;
            renderSuggestions(data);
        })
        .catch((error) => {
            console.error("error", error);
        });
}

function renderSuggestions(data) {
    var suggestions = $(".tab-content").eq(TABS.suggestions);
    var hasContent = suggestions.find("table").length > 0;

    if (!hasContent) {
        data.forEach(function(item) {
            var componentContainer = $("<div>").addClass(
                "my-2 shadow  text-white bg-dark p-1",
            );

            componentContainer.append(
                `
            <div class="d-flex justify-content-between">
                <table class="ms-1">
                    <td class="align-middle">${item.name}</td>
                    <td class="align-middle"> - </td>
                    <td class="align-middle">${item.email}</td>
                    <td class="align-middle">
                </table>
                <div>
                  <button id="create_request_btn_" class="btn btn-primary me-1">Connect</button>
                </div>
            </div>
        `,
            );

            suggestions.append(componentContainer);
        });
    }
}

export { getSuggestions, renderSuggestions };
