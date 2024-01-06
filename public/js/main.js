var loadMoreLink = "";
var skeletonId = "#skeleton";
var contentId = "#content";
var tabContentClass = ".tab-content";
var rawTabContentClass = "tab-content";
var skipCounter = 0;
var takeAmount = 10;
var TABS = {
    suggestions: {
        name: "suggestions",
        index: 0,
        nextLink: "",
    },
    "sent-requests": {
        name: "sent-requests",
        index: 1,
        nextLink: "",
    },
    "received-requests": {
        name: "received-requests",
        index: 2,
        nextLink: "",
    },
    connections: {
        name: "connections",
        index: 3,
        nextLink: "",
    },
};
var activeTab = Object.keys(TABS)[0];

function getRequests() {
    // get content index
    var requests = $(tabContentClass).eq(
        activeTab === TABS["sent-requests"].index
            ? TABS["sent-requests"].index
            : TABS["received-requests"].index,
    );
    var hasContent = requests.find("table").length > 0;

    if (!hasContent) {
        $(skeletonId).show();
        axios
            .get(`/api/${activeTab}`)
            .then((response) => {
                const { data, links } = response.data;
                renderRequests(activeTab, data);
                TABS[activeTab].nextLink = links.next;
                isLoadMoreVisible(!!TABS[activeTab].nextLink);
            })
            .catch((error) => {
                console.error("error", error);
            })
            .finally(() => {
                $(skeletonId).hide();
            });
    }
}

function loadMore(activeTab) {
    switch (activeTab) {
        case "sent-requests":
            getMoreRequests(activeTab);
            break;
        case "received-requests":
            getMoreRequests(activeTab);
            break;
        case "connections":
            getMoreConnections();
            break;
        default:
            getMoreSuggestions();
            break;
    }
}

function getMoreRequests(activeTab) {
    $(skeletonId).show();
    axios
        .get(`${TABS[activeTab].nextLink}`)
        .then((response) => {
            const { data, links } = response.data;
            renderRequests(activeTab, data);
            TABS[activeTab].nextLink = links.next;
            isLoadMoreVisible(!!TABS[activeTab].nextLink);
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $(skeletonId).hide();
        });
}

function isLoadMoreVisible(condition) {
    if (condition) {
        $("#load_more_btn_parent").removeClass("d-none");
    } else {
        $("#load_more_btn_parent").addClass("d-none");
    }
}

function renderComponentContainer() {
    return $("<div>").addClass("my-2 shadow  text-white bg-dark p-1");
}

function renderRequests(activeTab, data) {
    var requests = $(tabContentClass).eq(
        activeTab === TABS["sent-requests"].index
            ? TABS["sent-requests"].index
            : TABS["received-requests"].index,
    );

    data.forEach(function(item) {
        const componentContainer = renderComponentContainer();

        componentContainer.append(
            `
            <div class="d-flex justify-content-between">
                ${renderNameEmail(item.name, item.email)}
                <div>
                  ${activeTab === TABS["sent-requests"].index
                ? renderWithdrawRequest()
                : renderAcceptRequest()
            }
                </div>
            </div>
        `,
        );

        requests.append(componentContainer);
    });
}

function renderWithdrawRequest() {
    return `
    <button id="cancel_request_btn_" class="btn btn-danger me-1">
        Withdraw
    </button>
`;
}

function renderAcceptRequest() {
    return `
    <button id="accept_request_btn_" class="btn btn-primary me-1" onclick="">
        Accept
    </button>
`;
}

function renderNameEmail(name, email) {
    return `
        <table class="ms-1">
          <td class="align-middle">${name}</td>
          <td class="align-middle"> - </td>
          <td class="align-middle">${email}</td>
          <td class="align-middle">
        </table>
    `;
}

function getConnections() { }

function getMoreConnections() {
    // Optional: Depends on how you handle the "Load more"-Functionality
    // your code here...
}

function getConnectionsInCommon(userId, connectionId) {
    // your code here...
}

function getMoreConnectionsInCommon(userId, connectionId) {
    // Optional: Depends on how you handle the "Load more"-Functionality
    // your code here...
}

function getSuggestions() {
    var suggestions = $(tabContentClass).eq(TABS.suggestions.index);
    var hasContent = suggestions.find("table").length > 0;

    if (!hasContent) {
        $("#skeleton").show();
        axios
            .get("/api/suggestions")
            .then((response) => {
                const { data, links } = response.data;
                renderSuggestions(data);
                TABS[activeTab].nextLink = links.next;
                isLoadMoreVisible(!!TABS[activeTab].nextLink);
            })
            .catch((error) => {
                console.error("error", error);
            })
            .finally(() => {
                $("#skeleton").hide();
            });
    }
}

function renderSuggestions(data) {
    var suggestions = $(tabContentClass).eq(TABS.suggestions.index);
    data.forEach(function(item) {
        var componentContainer = $("<div>").addClass(
            "my-2 shadow  text-white bg-dark p-1",
        );

        componentContainer.append(
            `
            <div class="d-flex justify-content-between">
                ${renderNameEmail(item.name, item.email)}
                <div>
                    <button
                        data-id="${item.id}"
                        class="btn btn-primary me-1 create-request">
                        Connect
                    </button>
                </div>
            </div>
        `,
        );

        suggestions.append(componentContainer);
    });
    addConnectRequestHandlers();
}

/**
 * Add listeners when data is rendered
 */
function addConnectRequestHandlers() {
    $(".create-request").click(function() {
        const id = $(this).data("id");
        console.log(id);
        sendRequest(id);
    });
}

function getMoreSuggestions() {
    // Optional: Depends on how you handle the "Load more"-Functionality
    // your code here...
}

function sendRequest(userId) {
    axios
        .post(`/api/pending-friends`, {
            recipient_id: userId,
        })
        .then((response) => {
            const { data, links } = response.data;
            console.log(response);
            // renderRequests(activeTab, data);
            // TABS[activeTab].nextLink = links.next;
            // isLoadMoreVisible(!!TABS[activeTab].nextLink);
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $(skeletonId).hide();
        });
}

function deleteRequest(userId, requestId) {
    // your code here...
}

function acceptRequest(userId, requestId) {
    // your code here...
}

function removeConnection(userId, connectionId) {
    // your code here...
}

function handleCurrentActiveTab() {
    queryContentData();

    $("input[type='radio'][name='btnradio']").change(function() {
        activeTab = $(this).val();
        showContent(activeTab);
        queryContentData(activeTab);
    });
}

function showDefaultTab() {
    $("#btnradio1").attr("checked", "checked");
}

function queryContentData() {
    isLoadMoreVisible(!!TABS[activeTab].nextLink);
    switch (activeTab) {
        case "sent-requests":
            getRequests();
            break;
        case "received-requests":
            getRequests();
            break;
        case "connections":
            getConnections();
            break;
        default:
            getSuggestions();
            break;
    }
}

function showContent(activeTab) {
    switch (activeTab) {
        case "sent-requests":
            var sent_requests = displaySingleSibling(
                TABS["sent-requests"].index,
                rawTabContentClass,
            );
            undisplaySiblings(sent_requests, rawTabContentClass);
            break;
        case "received-requests":
            var received_requests = displaySingleSibling(
                TABS["received-requests"].index,
                rawTabContentClass,
            );
            undisplaySiblings(received_requests, rawTabContentClass);
            break;
        case "connections":
            var connections = displaySingleSibling(
                TABS.connections.index,
                rawTabContentClass,
            );
            undisplaySiblings(connections, rawTabContentClass);
            break;
        default:
            var suggestions = displaySingleSibling(
                TABS.suggestions.index,
                rawTabContentClass,
            );
            undisplaySiblings(suggestions, rawTabContentClass);
            break;
    }
}

function displaySingleSibling(index, className) {
    return $("." + className)
        .eq(index)
        .removeClass("d-none");
}

function undisplaySiblings(element, className) {
    element.siblings("." + className).addClass("d-none");
}

$(function() {
    handleCurrentActiveTab();

    $("#load_more_btn").click(function() {
        loadMore(activeTab);
    });
});
