var loadMoreLink = "";
var skeletonId = "#skeleton";
var contentId = "#content";
var tabContentClass = ".tab-content";
var rawTabContentClass = "tab-content";
var skipCounter = 0;
var takeAmount = 10;
var connectionData = [];
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
        activeTab === TABS["sent-requests"].name
            ? TABS["sent-requests"].index
            : TABS["received-requests"].index,
    );

    var hasContent = requests.find("table").length > 0;
    // if it has content, re-render
    if (hasContent) {
        requests.child().remove();
    }

    $(skeletonId).show();

    axios
        .get(`/api/${activeTab}`)
        .then((response) => {
            const { data, links } = response.data;

            if (!hasContent) {
                renderRequests(activeTab, data);
            }
            TABS[activeTab].nextLink = links.next;
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $(skeletonId).hide();
            isLoadMoreVisible(!!TABS[activeTab].nextLink);
        });
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
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $(skeletonId).hide();
            isLoadMoreVisible(!!TABS[activeTab].nextLink);
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
        activeTab === TABS["sent-requests"].name
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
                  ${activeTab === TABS["sent-requests"].name
                ? renderWithdrawRequest(item)
                : renderAcceptRequest(item)
            }
                </div>
            </div>
        `,
        );

        requests.append(componentContainer);
    });
    if (activeTab === "sent-requests") addWithdrawRequestHandlers();
    else addAcceptRequestHandlers();
}

function renderWithdrawRequest(item) {
    return `
        <button
            data-id="${item.id}"
            class="btn btn-danger me-1 withdraw-request">
            Withdraw
        </button>

`;
}

function renderAcceptRequest(item) {
    return `
        <button
            data-id="${item.id}"
            class="btn btn-danger me-1 accept-request">
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

function getConnections() {
    var connections = $(tabContentClass).eq(TABS.connections.index);

    var hasContent = connections.find("table").length > 0;

    if (hasContent) {
        requests.child().remove();
    }

    $("#skeleton").show();
    axios
        .get("/api/friends")
        .then((response) => {
            const { data, links } = response.data;
            connectionData = data;
            if (!hasContent) {
                renderConnections(data);
            }
            TABS[activeTab].nextLink = links.next;
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $("#skeleton").hide();
            isLoadMoreVisible(!!TABS[activeTab].nextLink);
        });
}

function addCommonConnectionHandlers() {
    $(".get-common-connections").click(function() {
        const id = $(this).data("id");
        getCommon(id);
    });
}

function getCommon(userId) {
    var commonData = connectionData.filter((current) => current.id === userId);
    if (commonData && commonData.length > 0) {
        if (commonData[0].mutual_friends.length > 9) {
            $(`#load_more_connections_in_common_${userId}`).show();
            $(`#load_more_connections_in_common_${userId}`).click(function() {
                const id = $(this).data("id");
                const idx = connectionData.indexOf(commonData[0]);
                connectionData.splice(idx, 1, {
                    ...commonData[0],
                    mutual_friends: commonData[0].mutual_friends.slice(9),
                });
                getCommon(userId);
            });
        } else {
            $(`#load_more_connections_in_common_${userId}`).hide();
        }

        renderMutuals(userId, commonData[0].mutual_friends);
    } else {
        $(`#load_more_connections_in_common_${userId}`).hide();
    }
    $(`#inner_skeleton_${userId}`).hide();
}

function renderMutuals(userId, mutualData = []) {
    for (const item of mutualData.slice(0, 9)) {
        $(`#common_content_${userId}`).append(
            `
        <div class="d-flex justify-content-between">
            ${renderNameEmail(item.name, item.email)}
        </div>
    `,
        );
    }
}
function renderConnections(data) {
    var requests = $(tabContentClass).eq(TABS["connections"].index);

    data.forEach(function(item) {
        const componentContainer = renderComponentContainer();

        componentContainer.append(
            `
            <div class="my-2 shadow text-white bg-dark p-1" id="">
              <div class="d-flex justify-content-between">
                ${renderNameEmail(item.name, item.email)}
                <div> <button style="width: 220px" id="get_connections_in_common_" class="btn btn-primary get-common-connections" type="button"
                    data-id="${item.id}"
                    data-bs-toggle="collapse"
                data-bs-target="#collapse_${item.id}" aria-expanded="false"
                aria-controls="collapseExample"
                ">
                    Connections in common ()
                  </button>
                  <button
                    data-id="${item.id}"
                    class="btn btn-danger me-1 remove-connection">
                    Remove Connection
                    </button>
                </div>

              </div>
              <div class="collapse" id="collapse_${item.id}">

                <div id="common_content_${item.id}" class="p-2"> </div>
                <div id="connections_in_common_skeletons_">
                    <div id="inner_skeleton_${item.id}">
                        <div class="d-flex align-items-center  mb-2  text-white bg-dark p-1 shadow" style="height: 45px">
                          <strong class="ms-1 text-primary">Loading...</strong>
                          <div class="spinner-border ms-auto text-primary me-4" role="status" aria-hidden="true"></div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-center w-100 py-2">
                  <button class="btn btn-sm btn-primary" id="load_more_connections_in_common_${item.id
            }">Load
                    more</button>
                </div>
              </div>
            </div>
        `,
        );

        requests.append(componentContainer);
    });
    addConnectionHandlers();
    addCommonConnectionHandlers();
}

function getMoreConnections() {
    $(skeletonId).show();

    axios
        .get(`${TABS[activeTab].nextLink}`)
        .then((response) => {
            const { data, links } = response.data;
            renderConnections(data);
            TABS[activeTab].nextLink = links.next;
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $(skeletonId).hide();
            isLoadMoreVisible(!!TABS[activeTab].nextLink);
        });
}

function getConnectionsInCommon(userId) {
    var connections = $(tabContentClass).eq(TABS.connections.index);

    var hasContent = connections.find("table").length > 0;

    if (hasContent) {
        requests.child().remove();
    }

    $("#skeleton").show();
    axios
        .get("/api/friends")
        .then((response) => {
            const { data, links } = response.data;
            if (!hasContent) {
                renderConnections(data);
            }
            TABS[activeTab].nextLink = links.next;
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $("#skeleton").hide();
            isLoadMoreVisible(!!TABS[activeTab].nextLink);
        });
}

function getMoreConnectionsInCommon(userId, connectionId) {
    // Optional: Depends on how you handle the "Load more"-Functionality
    // your code here...
}

function getSuggestions() {
    var suggestions = $(tabContentClass).eq(TABS.suggestions.index);

    var hasContent = suggestions.find("table").length > 0;

    if (hasContent) {
        requests.child().remove();
    }

    $("#skeleton").show();
    axios
        .get("/api/suggestions")
        .then((response) => {
            const { data, links } = response.data;
            if (!hasContent) {
                renderSuggestions(data);
            }
            TABS[activeTab].nextLink = links.next;
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $("#skeleton").hide();
            isLoadMoreVisible(!!TABS[activeTab].nextLink);
        });
}

function renderSuggestions(data) {
    var suggestions = $(tabContentClass).eq(TABS.suggestions.index);

    data.forEach(function(item) {
        const componentContainer = renderComponentContainer();

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
        sendRequest(id);
        $(this).parent().parent().parent().hide();
    });
}

function addWithdrawRequestHandlers() {
    $(".withdraw-request").click(function() {
        const id = $(this).data("id");
        destroyRelationship(id);
        $(this).parent().parent().parent().hide();
    });
}

function addAcceptRequestHandlers() {
    $(".accept-request").click(function() {
        const id = $(this).data("id");
        destroyRelationship(id);
        $(this).parent().parent().parent().hide();
    });
}

function addConnectionHandlers() {
    $(".remove-connection").click(function() {
        const id = $(this).data("id");
        destroyRelationship(id);
        $(this).parent().parent().parent().parent().hide();
    });
}

function getMoreSuggestions() {
    $(skeletonId).show();

    axios
        .get(`${TABS[activeTab].nextLink}`)
        .then((response) => {
            const { data, links } = response.data;
            renderSuggestions(data);
            TABS[activeTab].nextLink = links.next;
        })
        .catch((error) => {
            console.error("error", error);
        })
        .finally(() => {
            $(skeletonId).hide();
            isLoadMoreVisible(!!TABS[activeTab].nextLink);
        });
}

function destroyRelationship(userId) {
    axios
        .delete(`/api/friends/remove`, {
            friend_id: userId,
        })
        .catch((error) => {
            console.error("error", error);
        });
}

function acceptRequest(userId) {
    axios
        .post(`/api/accept-friend`, {
            sender_id: userId,
        })
        .catch((error) => {
            console.error("error", error);
        });
}

function sendRequest(userId) {
    axios
        .post(`/api/pending-friends`, {
            recipient_id: userId,
        })
        .catch((error) => {
            console.error("error", error);
        });
}

function deleteRequest(userId, requestId) {
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
